const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { refreshAccessToken } = require('../oauthConfig');

function generateState() {
  return crypto.randomBytes(20)
  .toString('hex');
}

router.get('/google', (req, res, next) => {
  const state = generateState();
  req.session.oauthState = state;
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    includeGrantedScopes: true,
    responseType: 'code',
    state: state
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const state = req.query.state;
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }
  delete req.session.oauthState;

  passport.authenticate('google',{
    failureRedirect: '/login' 
  })
  (req, res, next);
}, (req, res, ) => {
  req.session.accessToken = req.user.accessToken;
  req.session.refreshToken = req.user.refreshToken;

  console.log(req.session)
  res.redirect('/home');
});

router.get('/logout', (req, res, next) => {
  const accessToken = req.session.accessToken;

  function destroyAndLogout() {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.redirect('/');
    });
  }

  if (accessToken) {
    axios.post(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`).then(() => {
      console.log('Google token revoked successfully');
      destroyAndLogout()
    }).catch((error) => {
      console.error('Error revoking Google token:', error.response?.data || error.message);
      destroyAndLogout()
    });
  }
  else {
    console.log('No access token found, proceeding with logout');
    destroyAndLogout()
  }
});

// Middleware to check token expiration and refresh if necessary
const checkAndRefreshToken = async (req, res, next) => {
  if (!req.session.accessToken) {
    return res.redirect('/login');
  }

  if (req.session.tokenType === 'access_token_only') {
    // We only have an access token, can't refresh
    if(isTokenExpired(req.session.accessToken)) {
      res.redirect("/auth/google")
    }
    else{
      return next();
    }
  }

  try {
    // Check if token is expired (you should implement this check)
    if (isTokenExpired(req.session.accessToken)) {
      if (req.session.refreshToken) {
        const newAccessToken = await refreshAccessToken(req.session.refreshToken);
        req.session.accessToken = newAccessToken;
      } else {
        // No refresh token available, redirect to re-authenticate
        return res.redirect('/auth/google');
      }
    }
    next();
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    // Token refresh failed, clear the session and redirect to login
    req.session.destroy(err => {
      if (err){
        console.error('Session destruction error:', err);
      }
      res.redirect('/login');
    });
  }
};

async function isTokenExpired(token) {
  try {
    // Attempt to use the token to access a Google API
    await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // If the request succeeds, the token is still valid
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized response means the token is expired or invalid
      return true;
    }
    // For other errors, we can't be sure about the token status
    console.error('Error checking token validity:', error.message);
    return true; // Assume expired/invalid to be safe
  }
}

// Use this middleware for routes that require authentication
router.get('/protected', checkAndRefreshToken, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;
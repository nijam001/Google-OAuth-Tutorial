const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { refreshAccessToken } = require('../oauthConfig');

function generateState() {
  return crypto.randomBytes(20).toString('hex');
}

router.get('/google', (req, res, next) => {
  const state = generateState();
  req.session.oauthState = state;
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const state = req.query.state;
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }
  delete req.session.oauthState;

  passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
}, (req, res) => {
  req.session.accessToken = req.user.accessToken;
  req.session.refreshToken = req.user.refreshToken;
  res.redirect('/home');
});

router.get('/logout', (req, res, next) => {
  const accessToken = req.session.accessToken;

  const logoutAndRedirect = () => {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.redirect('/');
    });
  };

  if (accessToken) {
    axios.post(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`)
      .then(() => {
        console.log('Google token revoked successfully');
        logoutAndRedirect();
      })
      .catch((error) => {
        console.error('Error revoking Google token:', error.response?.data || error.message);
        logoutAndRedirect();
      });
  } else {
    console.log('No access token found, proceeding with logout');
    logoutAndRedirect();
  }
});

// Middleware to check token expiration and refresh if necessary
const checkAndRefreshToken = async (req, res, next) => {
  if (!req.session.accessToken) {
    return res.redirect('/login');
  }

  try {
    // Check if token is expired (you might want to store expiration time)
    // For simplicity, we'll assume we need to refresh on every request
    const newAccessToken = await refreshAccessToken(req.session.refreshToken);
    req.session.accessToken = newAccessToken;
    next();
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    res.redirect('/login');
  }
};

// Use this middleware for routes that require authentication
router.get('/protected', checkAndRefreshToken, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;
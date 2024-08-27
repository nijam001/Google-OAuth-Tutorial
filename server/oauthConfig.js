const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');

function configureOAuth() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, params, profile, done) => {
    const expiresIn = params.expires_in * 1000; // convert to milliseconds
    const accessTokenExpiryDate = new Date(Date.now() + expiresIn);

    profile.accessTokenExpiresAt = accessTokenExpiryDate;
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    console.log("Profile: ", profile);
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

// Middleware to check token expiration and refresh if necessary
async function checkAndRefreshToken(req, res, next){
  if (!req.session.accessToken) {
    return res.redirect('/login');
  }
  try {
    // Check if token is expired (you should implement this check)
    if (isTokenExpired(req.session.accessTokenExpiresAt)) {
      if (req.session.refreshToken) {
        const newAccessToken = await refreshAccessToken(req.session.refreshToken);
        req.session.accessToken = newAccessToken;
        console.log("Token has been Refreshed");
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
}

async function isTokenExpired(expiryDate){
  function isWithinFiveMinutes(expirationDate) {
    const currentTime = new Date();
    const expirationTime = new Date(expirationDate);
    const timeDifference = expirationTime - currentTime;
    const fiveMinutesInMilliseconds = 5 * 60 * 1000;
    return timeDifference <= fiveMinutesInMilliseconds && timeDifference > 0;
  }

  try{
    if (Date.now() >= new Date(expiryDate).getTime()) {
      return true;
    }
    return isWithinFiveMinutes(expiryDate);
  }catch (error) {
    console.error('Error checking token validity:', error.message);
    return true;
  }
}

/**
 * Refreshes a Google OAuth access token using a refresh token.
 *
 * @param {string} refreshToken - The refresh token to use for refreshing the access token.
 * @return {string} The newly refreshed access token.
 */
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    throw error;
  }
}

module.exports = {configureOAuth, checkAndRefreshToken};
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');

function configureOAuth() {
  // Configure Google Strategy
  //Authorization parameter
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('OAuth callback received');

    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    console.log('Profile:', profile);
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
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

module.exports = {configureOAuth, refreshAccessToken};
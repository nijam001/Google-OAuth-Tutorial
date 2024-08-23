// File: app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const { configureOAuth } = require('./oauthConfig');
const mainRoutes = require('./routes/main');
const oauthRoutes = require('./routes/oauth');

const app = express();

// Use Helmet!
app.use(helmet());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure OAuth
configureOAuth();

// Serve static files
app.use(express.static('public'));

// Use routes
app.use('/', mainRoutes);
app.use('/auth', oauthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
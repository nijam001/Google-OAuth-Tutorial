// require('dotenv').config();
// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const path = require('path');
// const helmet = require('helmet');
// const axios = require('axios');
// const crypto = require('crypto');

// const app = express();

// function generateState() {
//   return crypto.randomBytes(20).toString('hex');
// }

// // Use Helmet!
// app.use(helmet());

// // Configure session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//     httpOnly: true, // Mitigate XSS attacks
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Configure Google Strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'http://localhost:3000/auth/google/callback'
//   },
//   (accessToken, refreshToken, profile, done) => {
//     // Store the accessToken in the profile
//     profile.accessToken = accessToken;
//     return done(null, profile);
//   }
// ));

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// // Middleware to check if user is authenticated
// const isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// };

// // Serve static files
// app.use(express.static('public'));

// // Routes
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/login', (req, res) => {
//   if (req.isAuthenticated()) {
//     return res.redirect('/home');
//   }
//   res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

// app.get('/auth/google', (req, res, next) => {
//   const state = generateState();
//   req.session.oauthState = state;
//   passport.authenticate('google', { 
//     scope: ['profile', 'email'],
//     state: state
//   })(req, res, next);
// });

// app.get('/auth/google/callback', (req, res, next) => {
//   const state = req.query.state;
//   if (state !== req.session.oauthState) {
//     return res.status(403).send('Invalid state parameter');
//   }
//   delete req.session.oauthState;

//   passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
// }, (req, res) => {
//   req.session.accessToken = req.user.accessToken;
//   res.redirect('/home');
// });

// app.get('/home', isAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'home.html'));
// });

// app.get('/user', isAuthenticated, (req, res) => {
//   res.json(req.user);
// });

// app.get('/logout', (req, res, next) => {
//   const accessToken = req.session.accessToken;

//   const logoutAndRedirect = () => {
//     req.session.destroy(err => {
//         if (err) {
//             console.log(err);
//             return next(err);
//         }
//         // res.status(200).send('OK');
//         res.redirect('/')
//     });
//   };

//   if (accessToken) {
//     axios.post(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`)
//       .then(() => {
//         console.log('Google token revoked successfully');
//         logoutAndRedirect();
//       })
//       .catch((error) => {
//         console.error('Error revoking Google token:', error.response?.data || error.message);
//         logoutAndRedirect();
//       });
//   } else {
//     console.log('No access token found, proceeding with logout');
//     logoutAndRedirect();
//   }
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// app.listen(3000, () => {
//   console.log('Server running on http://localhost:3000');
// });
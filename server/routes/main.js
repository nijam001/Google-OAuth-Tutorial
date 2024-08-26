const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/home');
  }
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'login.html'));
});

router.get('/home', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'home.html'));
});

router.get('/user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

router.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'privacy.html'));
})

router.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'tos.html'));
})

module.exports = router;
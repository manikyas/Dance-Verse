const express = require('express');
const router = express.Router();

// Render the signup page
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

// Render the login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle signup form submission
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  // Add logic to save user to the database
  console.log(`New user: ${username}`);
  res.redirect('/auth/login');
});

// Handle login form submission
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Add logic to authenticate user
  console.log(`User login: ${username}`);
  req.session.user = username; // Save user in session
  res.redirect('/'); // Redirect to home page after login
});

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login'); // Redirect to login page after logout
  });
});

module.exports = router;

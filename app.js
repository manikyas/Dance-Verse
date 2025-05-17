const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/danceapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const app = express();
const PORT = 3000;

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'danceverse_secret',
  resave: false,
  saveUninitialized: true,
}));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next(); // User is authenticated, proceed to the next middleware/route
  } else {
    res.redirect('/auth/login'); // Redirect to login page if not authenticated
  }
}

// Import auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Protect the home page and other routes
const indexRoutes = require('./routes/index');
app.use('/', checkAuth, indexRoutes);

// Import additional routes
const songRoutes = require('./routes/songs');
const choreographyRoutes = require('./routes/choreographies');
const performanceRoutes = require('./routes/performances');
const battleRoutes = require('./routes/battles');
const ratingsRoutes = require('./routes/ratings');

// Use additional routes
app.use('/songs', songRoutes);
app.use('/choreographies', choreographyRoutes);
app.use('/performances', performanceRoutes);
app.use('/battles', battleRoutes);
app.use('/ratings', ratingsRoutes);

// Import external API routes
const externalRoutes = require('./routes/external');
app.use('/external', externalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



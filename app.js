const mongoose = require('mongoose');
const express = require('express');
const path = require('path');

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

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

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



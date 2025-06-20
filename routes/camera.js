const express = require('express');
const router = express.Router();

// Route for camera page
router.get('/', (req, res) => {
  const videoId = req.query.videoId || '';
  const range = req.query.range || '0-60'; // Default is 0-60 seconds
  
  // Allow access even without videoId - time range might be in localStorage
  res.render('camera', { 
    title: 'Dance Recording Studio',
    videoId, 
    range
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Route for camera page
router.get('/', (req, res) => {
  const videoId = req.query.videoId || '';
  const range = req.query.range || '0-60'; // Default is 0-60 seconds
  const mode = req.query.mode || '';
  const battleId = req.query.battleId || '';
  const code = req.query.code || '';
  
  // Allow access if it's battle mode or if videoId is provided
  if (!videoId && mode !== 'battle' && !code) {
    return res.redirect('/ratings');
  }
  
  res.render('camera', { 
    title: mode === 'battle' ? 'Dance Battle Recording' : 'Dance Recording Studio',
    videoId, 
    range,
    mode,
    battleId,
    code
  });
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch choreographies for a specific song from YouTube
router.get('/', async (req, res) => {
  const songTitle = req.query.songTitle; // Get the song title from the query parameter
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  console.log('Received songTitle:', songTitle); // Debugging log

  try {
    if (!songTitle) {
      return res.render('choreographies', { title: 'Choreographies', choreographies: [], message: 'No song selected.' });
    }

    // Fetch choreographies for the selected song
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${songTitle} dance choreography`,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    console.log('YouTube API response:', response.data); // Debugging log

    const choreographies = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));

    const message = choreographies.length > 0 ? '' : 'No choreographies found for this song.';
    res.render('choreographies', { title: `Choreographies for ${songTitle}`, choreographies, message });
  } catch (err) {
    console.error('Error fetching choreographies from YouTube:', err.message);
    res.render('choreographies', { title: 'Choreographies', choreographies: [], message: 'An error occurred while fetching choreographies.' });
  }
});

// Route to display a choreography in fullscreen
router.get('/fullscreen', (req, res) => {
  const videoId = req.query.videoId; // Get the videoId from the query parameter
  if (!videoId) {
    return res.redirect('/choreographies'); // Redirect back if no videoId is provided
  }
  res.render('fullscreen', { title: 'Fullscreen Choreography', videoId });
});

// Route to play a specific choreography video
router.get('/play', (req, res) => {
  const videoId = req.query.videoId; // Get the videoId from the query parameter
  if (!videoId) {
    return res.redirect('/choreographies'); // Redirect back if no videoId is provided
  }
  res.render('play', { title: 'Play Choreography', videoId });
});

module.exports = router;

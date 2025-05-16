const express = require('express');
const router = express.Router();
const axios = require('axios');
const Song = require('../models/Song');

// Home route
router.get('/', async (req, res) => {
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const query = 'trending dance songs';
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_API_KEY,
      },
    });

    const trendingSongs = response.data.items.map(item => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.render('index', { title: 'Home Page', trendingSongs });
  } catch (err) {
    console.error(err);
    res.render('index', { trendingSongs: [] });
  }
});

// About route
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// Songs route
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find();
    res.render('songs', { title: 'All Songs', songs });
  } catch (err) {
    res.status(500).send('Error fetching songs');
  }
});

module.exports = router;
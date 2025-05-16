require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let spotifyAccessToken = null;

// YouTube Data API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Fetch songs from Spotify
router.get('/spotify/songs', async (req, res) => {
  try {
    // Get Spotify access token if not already fetched
    if (!spotifyAccessToken) {
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        params: {
          grant_type: 'client_credentials',
        },
      });
      spotifyAccessToken = tokenResponse.data.access_token;
    }

    // Fetch songs from Spotify
    const query = 'dance'; // Example query
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 10,
      },
    });

    const songs = response.data.tracks.items.map(track => ({
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      previewUrl: track.preview_url,
    }));

    res.render('external-songs', { title: 'Spotify Songs', songs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching songs from Spotify');
  }
});

// Fetch choreographies from YouTube
router.get('/youtube/choreographies', async (req, res) => {
  try {
    const query = 'dance choreography'; // Example query
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    const choreographies = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.default.url,
    }));

    res.render('external-choreographies', { title: 'YouTube Choreographies', choreographies });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching choreographies from YouTube');
  }
});

// Fetch songs and trending songs for dance ratings
router.get('/choreographies', async (req, res) => {
  try {
    const query = req.query.query || 'dance'; // Default query if none is provided
    const spotifyAccessToken = await getSpotifyAccessToken();
    const songsResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 5,
      },
    });

    const songs = songsResponse.data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      thumbnail: track.album.images[0]?.url || '',
    }));

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const trendingResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'trending dance songs',
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_API_KEY,
      },
    });

    const trendingSongs = trendingResponse.data.items.map(item => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.render('external-choreographies', { title: 'Select a Song', songs, trendingSongs, query });
  } catch (err) {
    console.error(err);
    res.render('external-choreographies', { title: 'Select a Song', songs: [], trendingSongs: [], query: req.query.query || '' });
  }
});

// Helper function to get Spotify access token
async function getSpotifyAccessToken() {
  const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    params: {
      grant_type: 'client_credentials',
    },
  });
  return tokenResponse.data.access_token;
}

module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch songs for ratings with pagination
router.get('/', async (req, res) => {
  try {
    const query = req.query.query || 'dance'; // Default query if none is provided
    const spotifyAccessToken = await getSpotifyAccessToken();
    const limit = 5; // Number of songs per page
    const page = parseInt(req.query.page) || 1; // Current page
    const offset = (page - 1) * limit;

    const songsResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit,
        offset,
      },
    });

    const songs = songsResponse.data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      thumbnail: track.album.images[0]?.url || '',
    }));

    const nextPage = songsResponse.data.tracks.next ? page + 1 : null;
    const previousPage = songsResponse.data.tracks.previous ? page - 1 : null;

    res.render('ratings', { title: 'Select a Song for Ratings', songs, query, nextPage, previousPage });
  } catch (err) {
    console.error(err);
    res.render('ratings', { title: 'Select a Song for Ratings', songs: [], query: req.query.query || '', nextPage: null, previousPage: null });
  }
});

// Fetch choreographies for a selected song
router.get('/choreographies', async (req, res) => {
  try {
    const songTitle = req.query.songTitle; // Get the selected song title from the query
    if (!songTitle) {
      return res.render('choreographies', { title: 'Choreographies', choreographies: [], message: 'No song selected.' });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    // Fetch choreographies for the selected song
    let response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${songTitle} dance choreography`,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    let choreographies = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));

    // If no choreographies are found, fetch choreographies for similar songs
    if (choreographies.length === 0) {
      response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: 'popular dance choreographies',
          type: 'video',
          maxResults: 10,
          key: YOUTUBE_API_KEY,
        },
      });

      choreographies = response.data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      }));
    }

    res.render('choreographies', { title: `Choreographies for ${songTitle}`, choreographies, message: choreographies.length ? '' : 'No exact matches found. Showing similar choreographies.' });
  } catch (err) {
    console.error('Error fetching choreographies:', err.message);
    res.render('choreographies', { title: 'Choreographies', choreographies: [], message: 'An error occurred while fetching choreographies.' });
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

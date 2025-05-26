const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const localDefaultImageUrl = '/images/default-album-art.png'; // Define local default image

// Get all songs with search and pagination support
router.get('/', async (req, res) => {
  try {
    const query = req.query.query || 'dance'; // Default query if none is provided
    const spotifyAccessToken = await getSpotifyAccessToken(); // Fetch the access token dynamically
    const limit = 10; // Number of songs per page
    const page = parseInt(req.query.page) || 1; // Current page
    const offset = (page - 1) * limit;

    const songsResponse = await axios.get('https://api.spotify.com/v1/search', { // Correct Spotify API URL
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
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '',
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      popularity: track.popularity
    }));

    const nextPage = songsResponse.data.tracks.next ? page + 1 : null;
    const previousPage = songsResponse.data.tracks.previous ? page - 1 : null;

    res.render('songs', { 
      title: 'Select a Song to Learn Dance Moves',
      songs, 
      query, 
      nextPage: nextPage || null,
      previousPage: previousPage || null,
      defaultImageUrl: localDefaultImageUrl // Use local default image
    });
  } catch (err) {
    console.error('Error fetching songs from Spotify:', err);
    res.render('songs', { 
      title: 'Select a Song to Learn Dance Moves', 
      songs: [], 
      query: req.query.query || '', 
      nextPage: null, 
      previousPage: null,
      defaultImageUrl: localDefaultImageUrl, // Use local default image in error case
      error: 'Failed to load songs. Please try again.'
    });
  }
});

// Route to fetch choreographies for a selected song
router.get('/choreographies', async (req, res) => {
  try {
    const songTitle = req.query.songTitle;
    const artist = req.query.artist || '';

    if (!songTitle) {
      console.log('No song title provided, redirecting to /songs');
      return res.redirect('/songs');
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    console.log('Fetching choreographies for:', { songTitle, artist });

    // Build a better search query with the artist name if available
    const searchQuery = artist ? `${songTitle} ${artist} dance choreography` : `${songTitle} dance choreography`;

    // Fetch choreographies for the selected song
    let response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    console.log('YouTube API response:', response.data);

    let choreographies = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));

    console.log('Mapped choreographies:', choreographies);

    // If no choreographies are found, fetch choreographies for similar songs
    if (choreographies.length === 0) {
      console.log('No choreographies found, fetching popular dance choreographies');
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

      console.log('Fallback choreographies:', choreographies);
    }

    res.render('choreographies', { 
      title: `Choreographies for ${songTitle}`, 
      choreographies, 
      message: choreographies.length ? '' : 'No exact matches found. Showing similar choreographies.'
    });
  } catch (err) {
    console.error('Error fetching choreographies:', err.message);
    res.render('choreographies', { 
      title: 'Choreographies', 
      choreographies: [], 
      message: 'An error occurred while fetching choreographies.'
    });
  }
});

// API endpoint for Spotify search from modal
router.get('/api/spotify-search', async (req, res) => {
  try {
    const searchQuery = req.query.searchQuery;
    if (!searchQuery) {
      return res.status(400).json({ error: 'searchQuery is required' });
    }

    const spotifyAccessToken = await getSpotifyAccessToken();
    const limit = 10; // Number of songs to fetch for modal display

    const songsResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
      params: {
        q: searchQuery,
        type: 'track',
        limit,
      },
    });

    const songs = songsResponse.data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || localDefaultImageUrl, // Use local default image
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    }));

    res.json({ songs });

  } catch (err) {
    // Log detailed error information for debugging
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data from Spotify API:', err.response.data);
      console.error('Error status from Spotify API:', err.response.status);
      console.error('Error headers from Spotify API:', err.response.headers);
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response received from Spotify API:', err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request to Spotify API:', err.message);
    }
    res.status(500).json({ error: 'Failed to search songs from Spotify. Please check server logs for details.' });
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

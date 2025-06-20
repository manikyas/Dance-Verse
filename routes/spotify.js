const express = require('express');
const router = express.Router();
const axios = require('axios');

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret';

// Get Spotify access token using Client Credentials flow
async function getSpotifyAccessToken() {
  try {
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error.message);
    throw new Error('Failed to authenticate with Spotify');
  }
}

// Search for songs on Spotify
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const accessToken = await getSpotifyAccessToken();
    
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: q,
        type: 'track',
        limit: limit,
        market: 'US'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const tracks = searchResponse.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url || '/images/default-song.jpg',
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      external_urls: track.external_urls,
      spotify_url: track.external_urls.spotify
    }));
    
    res.json({
      success: true,
      tracks: tracks,
      total: searchResponse.data.tracks.total
    });
    
  } catch (error) {
    console.error('Spotify search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search Spotify',
      message: error.message 
    });
  }
});

// Get trending/popular dance tracks
router.get('/trending', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    // Search for popular dance tracks
    const danceGenres = ['dance', 'edm', 'pop', 'hip-hop', 'electronic'];
    const randomGenre = danceGenres[Math.floor(Math.random() * danceGenres.length)];
    
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: `genre:${randomGenre} year:2020-2025`,
        type: 'track',
        limit: 20,
        market: 'US'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const tracks = searchResponse.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url || '/images/default-song.jpg',
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      external_urls: track.external_urls,
      spotify_url: track.external_urls.spotify
    }));
    
    res.json({
      success: true,
      tracks: tracks,
      genre: randomGenre
    });
    
  } catch (error) {
    console.error('Spotify trending error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get trending tracks',
      message: error.message 
    });
  }
});

// Get track details by ID
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = await getSpotifyAccessToken();
    
    const trackResponse = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const track = trackResponse.data;
    
    res.json({
      success: true,
      track: {
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url || '/images/default-song.jpg',
        preview_url: track.preview_url,
        duration_ms: track.duration_ms,
        external_urls: track.external_urls,
        spotify_url: track.external_urls.spotify
      }
    });
    
  } catch (error) {
    console.error('Spotify track error:', error.message);
    res.status(404).json({ 
      error: 'Track not found',
      message: error.message 
    });
  }
});

module.exports = router;

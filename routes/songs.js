const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// MongoDB connection setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'danceapp';

// Get all songs
router.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const songs = await db.collection('songs').find().toArray();
    res.render('songs', { title: 'Songs', songs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching songs');
  } finally {
    await client.close();
  }
});

// Add a new song
router.post('/add', async (req, res) => {
  const { title, language, artist } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection('songs').insertOne({ title, language, artist });
    res.redirect('/songs');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding song');
  } finally {
    await client.close();
  }
});

module.exports = router;

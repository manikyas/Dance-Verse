const mongoose = require('mongoose');

const choreographySchema = new mongoose.Schema({
  step: String,
  time: Number
});

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  thumbnail: String,
  video: String,
  choreography: [choreographySchema]
});

module.exports = mongoose.model('Song', songSchema);
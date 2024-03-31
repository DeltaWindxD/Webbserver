const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: String,
  value: Number,
  // Add other fields as necessary
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
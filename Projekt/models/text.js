const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  content: String,
});

const Text = mongoose.model('Text', textSchema);

module.exports = Text;
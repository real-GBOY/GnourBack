
const mongoose = require('mongoose');

const Permission = mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
    }});

module.exports = mongoose.model('Permission', Permission);
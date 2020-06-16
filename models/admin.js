var mongoose = require('mongoose');

var admin = new mongoose.Schema({
   email : String,
   password: String
});

module.exports = mongoose.model('admin',admin)
var mongoose = require('mongoose');
var chat2_details = new mongoose.Schema({
    id : String,
    username : String,
    room : String
});
module.exports = mongoose.model('chat2_details',chat2_details)
var mongoose = require('mongoose');
var organiser = new mongoose.Schema({
   name: String,
   email: String,
   user_id: String,
   guest_id: String,
   stream_name: String,
   stream_name_2: String,
   stream_id: String,
   token: String,
   account_id: String,
   publish_url: String,
   publish_url_2: String,
   unity_url: String,
   web_green_screen_url: String,
   guest_token: String,
   time_stamp: String,
   last_call: String
});
module.exports = mongoose.model('organiser', organiser)
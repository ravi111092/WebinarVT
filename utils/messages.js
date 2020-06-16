const moment = require('moment');
const moment_time = require('moment-timezone');
var today = new Date();
var m_today = moment_time(today);
var indian_time = m_today.tz('Asia/kolkata').format('hh:mm:ss a');
console.log(indian_time);
function formatMessage(username, text) {
  return {
    username,
    text,
    time:indian_time
  };
}

module.exports = formatMessage;

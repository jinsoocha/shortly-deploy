var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/db');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (err) {
  console.log('connected!');
});

var userSchema = mongoose.Schema({
  id: Number,
  username: String,
  password: String
});

var linkSchema = mongoose.Schema({
  id: Number,
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

var User = mongoose.model('User', userSchema);

var Link = mongoose.model('Link', linkSchema);

module.exports = {
  User: User,
  Link: Link
};


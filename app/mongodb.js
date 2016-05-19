var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/test');

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
  user: User,
  link: Link
};

// var user1 = new User({
//   username: 'testuser',
//   password: 'testpw'
// });

// user1.save(function (err, user1) {
//   if (err) {
//     console.err('err', err);
//   } else {
//     console.log(user1 + ' saved');
//   }
// });

// var link1 = new Link({
//   url: 'http://1111.1111.111',
//   baseUrl: 'http://www.google.com',
//   title: 'google'
// });

// link1.save(function (err, link1) {
//   if (err) {
//     console.err('err', err);
//   } else {
//     console.log(link1 + ' saved');
//   }
// });


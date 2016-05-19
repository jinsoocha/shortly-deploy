var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var mongo = require('../db/mongodb');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  mongo.Link.find().then(function(links) {
    console.log('mongo links', links);
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  mongo.Link.find({ url : uri }, function(err, found) {
    if (found.length > 0) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var shasum = crypto.createHash('sha1');
        shasum.update(uri);
        var newLink = new mongo.Link ({
          url: uri,
          baseUrl: req.headers.origin,
          title: title,
          code: shasum.digest('hex').slice(0, 5),
          visits: 0
        });
        newLink.save(function (err, newLink) {
          if (err) {
            console.err('Err', err);
          } else {      
            console.log(newLink + ' saved');
            res.status(200).send(newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  mongo.User.find({ username: username }, function(err, found) {
    if (found.length > 0) {
      var pwHash = found[0].password;
      bcrypt.compare(password, pwHash, function(err, isMatch) {
        if (err) {
          console.err(err);
        } else if (isMatch === true) {
          util.createSession(req, res, found[0]);
        } else if (isMatch === false) {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  mongo.User.find({ username: username }, function(err, found) {
    if (found.length > 0) {
      console.log('Account already exists');
      res.redirect('/signup');
    } else {
      bcrypt.hash(password, null, null, function(err, hash) {
        if (err) {
          console.log(err);
        } else {
          var newUser = new mongo.User({
            username: username,
            password: hash
          });
          console.log('hashed pw', newUser);
          newUser.save(function(err, found) {
            if (err) {
              console.log(err);
            } else {
              console.log('new user saved', newUser);
              util.createSession(req, res, newUser);
            }
          });
        }
      });        
    }
  });
};

exports.navToLink = function(req, res) {
  if (req.params[0] !== 'favicon.ico') {
    console.log('finding url ', req.url, 'params', req.params);
    mongo.Link.find({ code: req.params[0] }, function(err, link) {
      if (err) {
        console.log(err);
      } else if (link.length === 0) {
        res.redirect('/');
      } else {
        link[0].update({ $set: {visits: link[0].visits + 1} }, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('updated link ', link[0]);
            return res.redirect(link[0].url);
          }
        });
      }
    });
  }
};
var passport = require('passport');
const db = require('../models/db');
const UserModal = db.user;

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
    UserModal.findById(_id, function (err, user) {
      done(err, user);
    });
  });
};
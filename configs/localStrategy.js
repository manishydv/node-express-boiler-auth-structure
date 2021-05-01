const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const db = require('../models/db');
const UserModal = db.user;
 
passport.use(
    new localStrategy({ usernameField: 'email' },(username, password, done) => {
        console.log("In--Passport.js-");
        UserModal.findOne({ email: username },(err, user) => {
                    if (err)
                        return done(err);
                    // unknown user
                    else if (!user)
                        return done(null, false, { message: 'Email is not registered' });
                    // wrong password
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: 'Wrong password.' });
                    // authentication succeeded
                    else
                        return done(null, user);
                });
        })
); 
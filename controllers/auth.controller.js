const passport = require("passport");
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const normalize = require('normalize-url');
const { uuid } = require('uuidv4');
const mailerHelper = require('../_helper/mailer');

const db = require('../models/db');
const UserModal = db.user;

module.exports = {
    register: async(req, res) => {
        console.log("--:: POST Request :: for :: register method ::--");
        var input = req.body;
        if (input.firstName == undefined || input.firstName == "") {
            return res.status(300).json({ status: 300, message: 'firstName is required' });
        } else if (input.lastName == undefined || input.lastName == "") {
            return res.status(300).json({ status: 300, message: 'lastName is required' });
        } else if (input.email == undefined || input.email == "") {
            return res.status(300).json({ status: 300, message: 'email is required' });
        } else if (input.password == undefined || input.password == "") {
            return res.status(300).json({ status: 300, message: 'password is required' });
        }

        var userData = await UserModal.findOne({
            email: input.email.toLowerCase()
        });

        if (userData) {
            return res.status(300).json({ status: 300, message: 'email-id already exist' });
        }

        var avatar = normalize(gravatar.url(input.email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        }), { forceHttps: true });

        return bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(300).json({ status: 300, message: 'Error hashing password' });
            }
            var body = {
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email.toLowerCase(),
                password: hash,
                avatar: avatar,
            };
            console.log("response data-", body);
            UserModal.create(body).then(user => {
                var token = user.generateJwt();
                res.status(200).json({ status: 200, message: 'User created successfully', user: user, token: token });
            }).catch((err) => {
                console.log('catch erro', err);
                res.status(300).json({ status: 300, message: 'Something went wrong', error: err });
            });
        });
    },
    authenticate: (req, res, ) => {
        console.log("--:: POST Request :: for :: authenticate method ::--");
        var input = req.body;
        console.log("--Login-req-body-", input);

        if (input.email == undefined || input.email == "") {
            return res.status(300).json({ status: 300, message: 'email is required' });
        } else if (input.password == undefined || input.password == "") {
            return res.status(300).json({ status: 300, message: 'password is required' });
        }

        //call local_strategy
        passport.authenticate("local", function(err, user, info) {
            console.log("auth---", user);
            if (err) {
                return res.send({ status: 300, message: 'Something went wrong please try again later' });
            }
            if (user) {
                var token = user.generateJwt();
                let msg = 'Successfully logged in user ' + user.firstName + ' ' + user.lastName;
                return res.send({ status: 200, message: msg, data: user, token: token });
            } else {
                return res.send({ status: 300, message: info.message });
            }
        })(req, res);
    },
    forgot: async(req, res) => {
        console.log("--:: POST Request :: for :: forgot method ::--");
        let input = req.body;

        if (input.email == undefined || input.email == "") {
            return res.status(300).json({ status: 300, message: 'email is required' });
        }

        var user = await UserModal.findOne({ email: input.email });
        if (user == undefined) {
            res.status(300).json({ status: 300, message: "There's no account with the info that you provided." });
        } else {
            var linkid = uuid();
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);
            var userParams = {
                passwordResetToken: linkid,
                passwordResetTokenExpiresAt: expireDate.toISOString()
            };

            var response = await UserModal.updateOne({ _id: user.id }, userParams);
            // { ok: 1, nModified: 1, n: 1 }
            if (response && response.nModified == 1) {
                // mailerHelper.sendResetPasswordLink(req, user.email, linkid);
                return res.send({ status: 200, message: "Reset password link sent. Please check your mail box.", resetcode: linkid });
            } else {
                return res.send({ status: 300, message: 'Something went wrong please try again later' });
            }
        }
    },
    validPasswordToken: async(req, res) => {
        console.log("--:: POST Request :: for :: validPasswordToken method ::--");
        let input = req.body;

        if (input.resettoken == undefined || input.resettoken == "") {
            return res.status(300).json({ status: 300, message: 'Token is required' });
        }
        var user = await UserModal.findOne({ passwordResetToken: input.resettoken });

        if (user) {
            var expireDate = user.passwordResetTokenExpiresAt;
            var currentDate = new Date();
            if (currentDate.getTime() > new Date(expireDate).getTime()) {
                return res.status(300).send({ status: 300, message: 'Reset password link is expired' });
            } else {
                return res.status(200).send({ status: 200, message: 'Token verified successfully.' });
            }
        } else {
            return res.status(300).send({ status: 300, message: 'Invalid token URL' });
        }
    },
    newPassword: async(req, res) => {
        console.log("--:: POST Request :: for :: newPassword method ::--");
        let key = req.params.id;
        let input = req.body;
        console.log(":: key ::", key);
        if (input.resettoken == undefined || input.resettoken == "") {
            return res.status(300).json({ status: 300, message: 'Invalid URL' });
        } else if (input.newPassword == undefined || input.newPassword == "") {
            return res.status(300).json({ status: 300, message: 'new password required' });
        }

        var user = await UserModal.findOne({ passwordResetToken: input.resettoken });

        if (user == undefined) {
            return res.status(300).send({ status: 300, message: "Invalid Token" });
        } else {
            var expireDate = user.passwordResetTokenExpiresAt;
            var currentDate = new Date();
            if (currentDate.getTime() > new Date(expireDate).getTime()) {
                return res.status(300).send({ status: 300, message: 'Reset password link is expired' });
            } else {
                bcrypt.hash(input.newPassword, 10, (err, hash) => {
                    if (err) {
                        return res.status(400).json({ message: 'Error hashing password' });
                    }
                    var params = {
                        passwordResetToken: '',
                        password: hash
                    };
                    console.log(":: before :: update ::", body);
                    UserModal.updateOne({ _id: user.id }, params, function(err, user) {
                        res.status(200).json({ status: 200, message: 'Password changed successfully', user: user });
                    }).catch((err) => {
                        console.log("err updating password");
                        console.log(err);
                        res.status(300).json({ status: 300, message: 'Error occured', error: err });
                    });
                });

            }
        }
    },
    changePassword: async(req, res) => {
        console.log("--:: POST Request :: for :: changePassword method ::--");
        let input = req.body;

        if (input.email == undefined || input.email == "") {
            return res.status(300).json({ status: 300, message: 'email is required' });
        } else if (input.newPassword == undefined || input.newPassword == "") {
            return res.status(300).json({ status: 300, message: 'newPassword is required' });
        }

        var user = await UserModal.findOne({ email: input.email.toLowerCase() });

        if (!user) {
            return res.status(400).json({ status: 400, message: 'Email does not exist' });
        }
        return bcrypt.hash(input.newPassword, 10, (err, hash) => {
            if (err) {
                return res.status(400).json({ message: 'Error hashing password' });
            }
            var params = {
                email: input.email.toLowerCase(),
                password: hash
            };
            console.log(":: before :: update ::", body);
            UserModal.updateOne({ _id: user.id }, params, function(err, user) {
                res.status(200).json({ status: 200, message: 'Password changed successfully', user: user });
            }).catch((err) => {
                console.log("err updating password");
                console.log(err);
                res.status(300).json({ status: 300, message: 'Error occured', error: err });
            });
        });
    }
}
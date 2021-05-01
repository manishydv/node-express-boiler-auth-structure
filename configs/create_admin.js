const bcrypt = require('bcryptjs');
const appJson = require('./app_config.json');
const db = require('../models/db');
const UserModal = db.user;


const emails = appJson.admin_email;
const pwd = appJson.admin_pwd;

if (appJson && email && emails.length > 1 && pwd != '') {
    emails.forEach(function(element) {
        UserModal.findOne({ email: element }, function(err, user) {
            if (!user) {
                try {
                    bcrypt.hash(pwd, 10, (err, hash) => {
                        if (err) {
                            return res.status(400).json({ message: 'Error hashing password' });
                        }
                        const body = {
                            firstName: "SUPER",
                            lastName: "ADMIN",
                            email: element,
                            password: hash,
                            role: "SUPER_ADMIN"
                        };
                        console.log("-create admin-", body);
                        UserModal.create(body).then(user => {
                            console.log('user', user);
                            if (user) {
                                console.log("SUCCESSFULLY CREATED SUPER ADMIN");
                                console.log(` ${element} - ${pwd}`);
                            } else {
                                console.log("FAIL TO CREATE SUPER ADMIN");
                            }
                        }).catch(() => {
                            return res.status(500).json({ message: 'Error occured' });
                        });

                    });
                } catch (e) {
                    console.log("err..! error on creatingadmin");
                    console.log(e);
                }
            }
        });
    });
}
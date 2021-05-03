const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const { v4: uuidv4 } = require('uuid');
const appJson = require('./app_config.json');
const db = require('../models/db');
const UserModal = db.user;

const mongodbURL = process.env.MONGODB_URI;

/**
 * LOCAL STRATEGY
 **/
exports.localStrategy = async ()=>{
	await passport.use(
		new localStrategy({ usernameField: 'email' },(username, password, done) => {
			console.log("::: IN--PASSPORT.JS :::");
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
}


/**
 * PRINT REQUEST LOGGER
 **/

exports.printRequestLogger = async (app) => {
	function isEmptyObject(value) {
		return Object.keys(value).length === 0 && value.constructor === Object;
	}
	await app.use((req, res, next) => {
		const _query = req.query;
	    const _params = req.params;
	    const _body = JSON.parse(JSON.stringify(req.body));
	    const _files = req.files;

		console.log('\x1b[36m%s\x1b[0m','\n##############################################');
		console.log('UUID         :', uuidv4());
		console.log('METHOD       :', req.method);
		console.log('HEADER       :', req.headers['user-agent']);
	    console.log('URL          :', req.originalUrl);
	    console.log('DATE TIME    :', new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}));
		if(!isEmptyObject(_query)) {
			console.log('\nQUERY  : ');
			console.log(_query);
		}
		if(!isEmptyObject(_params)) {
			console.log('\nPARAMS : ');
			console.log(_params);
		}
		
		if(!isEmptyObject(_body)) {
			console.log('\nBODY   : ');
			console.log(_body);
		}
		
		if(_files && _files.length > 0) {
			console.log('\nFILES  : ');
			console.log(_files);
		}
		console.log('\x1b[36m%s\x1b[0m','\n##############################################');
		next();
	});
};

/**
 * CONNECT DATABASE
 **/
 exports.connectDataBase = async () => {
	try {
		const options = {
		  useNewUrlParser: true,
		  useUnifiedTopology: true,
		  useCreateIndex: true,
		  useFindAndModify: false,
		  autoIndex: true,
		};
		const connection = await mongoose.connect(mongodbURL, options);
		if(connection) console.log('\x1b[32m%s\x1b[0m', 'Database Connected Successfully...');
	  } catch (err) {
		console.log('\x1b[31m%s\x1b[0m', 'Error while connecting database\n');
		console.log(err);
		// Exit process with failure
		process.exit(1);
	  }
};

/**
 * CREATE ADMIN
 **/
 exports.createAdmin = async ()=>{
	const adminEmailList = appJson.admin_email;
	const adminDefaultPassword = appJson.admin_pwd;
	if (adminDefaultPassword && adminEmailList && adminEmailList.length > 1) {
		try {
			for (const record of adminEmailList) {
				var user = await UserModal.findOne({ email: record });
				if (!user) {
					var hash = await bcrypt.hash(adminDefaultPassword, 10);
					if(hash){
						const params = {
							firstName: "SUPER",
							lastName: "ADMIN",
							email: element,
							password: hash,
							role: "SUPER_ADMIN"
						};
						var userData = await UserModal.create(params);
						if (userData) {
							console.log('\x1b[31m%s\x1b[0m','#################################################');
							console.log('\x1b[33m%s\x1b[0m','SUCCESSFULLY CREATED SUPER ADMIN');
							console.log('\x1b[33m%s\x1b[0m',`USERID : ${element}\nPASSWORD : ${adminDefaultPassword}`);
							console.log('\x1b[31m%s\x1b[0m','#################################################');
						} else {
							console.log("FAIL TO CREATE SUPER ADMIN");
						}
					}else{
						return { message: 'Error occured : hashing password', error: hash };
					}
				}
		   }
		} catch (e) {
			console.log("err..! error on creatingadmin");
			return { message: 'Error occured : on creating Admin', error: e };
		}
	}
}

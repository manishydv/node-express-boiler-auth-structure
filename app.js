// the system configrationsx
require("./configs/set_env");

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const bodyParser = require("body-parser");
const connect_database = require('./config/db_connect');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');

const app = express();

// Connect Database
connect_database();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.identifier = uuidv4();
    const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
    console.info(logString);
    next();
});


app.use(passport.initialize());
app.use('/api', indexRouter);

app.use('/storage', express.static(path.join(__dirname, 'uploads')));

//calling local_strategy
require("./config/localStrategy");

//Create Admin user
require("./config/create_admin");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
// the system configrationsx
require("./configs/set_env");

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require("cors");
const compression = require('compression');
const bodyParser = require("body-parser");
const appConfig = require('./configs/app_setting');
const cookieParser = require('cookie-parser');
var passport = require('passport');
const logger = require('morgan');
const apiRouter = require('./routes/api.routes');
const webRouter = require('./routes/web.routes');

const app = express();

// Connect Database
appConfig.connectDataBase();

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


//calling print_request_logger
appConfig.printRequestLogger(app);


app.use(passport.initialize());
app.use('/', webRouter);
app.use('/api/v1', apiRouter);

app.use('/storage', express.static(path.join(__dirname, 'uploads')));

//calling local_strategy
appConfig.localStrategy();

//Create Admin user
appConfig.createAdmin();

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
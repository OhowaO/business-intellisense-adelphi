var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var mongoose = require('mongoose');
var errorHandler = require('errorhandler');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
var app = express();

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}

//Configure Mongoose
//local
mongoose.connect('mongodb://localhost/passport-tutorial');
//cloud
//mongoose.connect('mongodb+srv://adelphi-team:adelphi@adelphi-fkstv.gcp.mongodb.net/test?retryWrites=true&w=majority');
mongoose.set('debug', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Models
require('./models/Users');
require('./models/OneTimePass');
require('./config/passport'); //keep this below all models

//Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var costsRouter = require('./routes/costs/index');
var dashboardRouter = require('./routes/costs/index');
var employeesRouter = require('./routes/costs/index');
var revenueRouter = require('./routes/costs/index');
var settingsRouter = require('./routes/costs/index');
var loginRouter = require('./routes/login');

//Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/costs', costsRouter);
app.use('/revenue', revenueRouter);
app.use('/employees', employeesRouter);
app.use('/settings', settingsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/*
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/

//Error handlers & middlewares
if(!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});


module.exports = app;

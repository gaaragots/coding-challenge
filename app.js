var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');

var index = require('./routes/index');
var profile = require('./routes/profile');

var app = express();

app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


// Setup routes
app.use('/', index);
app.use('/profile', profile);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// test node-localdb module
/*var db = require('node-localdb');
var user = db('./user.json');*/

// insert 
/*user.insert({username: 'jf', password: '123', email: '123@qq.com'}).then(function(u){
    console.log(u); // print user, with a auto generate uuid 
});*/

// findOne by email and password
/*user.findOne({username: 'jf', password: '1230'}).then(function(u){
    console.log(u); // undefined, because we don't have a user with username 'xx' 
});*/



module.exports = app;

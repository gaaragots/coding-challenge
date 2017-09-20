var express = require('express');
var router = express.Router();

var db = require('node-localdb');
var user = db('./user.json');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// var bodyParser = require('body-parser');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
  	user.findOne({email: username, password: password}).then(function(u){
		// undefined, because we don't have a user with this username 
		if (!u) {
			return done(null, false, { message: 'Incorrect username or password.' });
		}
		return done(null, u);
	});
  }
));

/* GET profile listing. */
router.get('/', function(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/profile');
	} else {
		res.render('index', { title: 'Express' });
	}
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/profile',
                                   failureRedirect: '/',
                                   failureFlash: false })
);

router.post('/register', function(req, res) {
	user.findOne({email: req.body.email}).then(function(u){
		// undefined, because we don't have a user with this username 
		if (!u) {
			// insert 
			user.insert({username: req.body.username, password: req.body.password, email: req.body.email}).then(function(u){
			    console.log(u);
			});
			req.flash('signupMessage', 'OK');
			res.redirect('/');// Message: Succes
		}
		req.flash('signupMessage', 'E-mail already used');
		res.redirect('/');// Message: already exist
	});
});

router.get('/logout', function(req, res, next) {
	req.logout();
    res.redirect('/');
});

module.exports = router;
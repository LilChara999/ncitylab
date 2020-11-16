var express = require('express');
var passport = require('passport');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	app.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	}),

	/* Handle Login POST */
	app.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	})),

	/* GET Registration Page */
	app.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	}),

	/* Handle Registration POST */
	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true
	})),

	/* GET Home Page */
	app.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	}),

	/* Handle Logout */
	app.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	})

	return router;
}

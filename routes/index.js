var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */

	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { user: req.user });
	});

	router.get('/login', function(req, res){
		res.render('login', {message: req.flash('message')});
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash : true
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true
	}));

	router.get('/faq', function(req, res, next) {
	  res.render('faq', { user: req.user });
	});

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	router.get('/test', isAuthenticated, function(req, res){
		res.render('test', { user: req.user,
			data: {},
			errors: {}
	 	});
	});

	router.post('/test', isAuthenticated, function(req, res){
		res.render('test', { user: req.user,
			data: req.body,
			errors: {
				comment: {
					msg: 'Напишите комментарий!'
				}
			}
	 	});
	});

	router.get('/admin', isAuthenticated, function(req, res){
		if (req.user.role == "admin") {
			res.render('admin_panel')
		}
		else {
			res.redirect('/')
		}
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('back');
	});

	return router;
}

var express = require('express');
var router = express.Router();
const locationController = require('../controllers/locations');
var Location = require('../models/location');
var multer = require('multer');
const mongouri = 'mongodb://localhost:27017/userssessions';
var GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
var storage = new GridFsStorage ({
  url: mongouri,
  file: (req, file) => {
    return new Promise((resolve,reject) =>{
      crypto.randomBytes(16, (err, buf)=>{
  if(err) {
      return reject(err);
  }
	const fileid = file.id;
  const filename = file.originalname;
  const fileinfo = {
			fileid:fileid,
      filename:filename,
      bucketName:'userdocs'
       };
       resolve(fileinfo);
   });
    }
  )}});
var upload = multer({ storage });

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

	router.post('/admin', isAuthenticated, function(req, res){
		if (req.user.role == "admin") {
			res.render('admin_panel')
		}
		else {
			res.redirect('/')
		}
	});

	router.post('/addlocation', upload.single('filename'), function(req, res, next) {
		if (req.user.role == "admin") {
			locationController.create(req,res);
		}
	  else {
			res.redirect('/')
		}
	});

	router.get('/locations/:name', isAuthenticated, async(req, res) => {
		if (req.user.role == "admin") {
			locationController.list(req, res);
		 }
	   else {
			 res.redirect('/')
	 	}
	});

	router.get('/locations/:name/image', isAuthenticated, async(req, res) => {
		if (req.user.role == "admin") {
			locationController.image(req, res);
		}
		else {
			res.redirect('/')
		}
	});

	router.get('/verysecretpage', function(req, res){
		res.render('happynewyear');
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('back');
	});

	return router;
}

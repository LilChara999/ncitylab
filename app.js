var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dbConfig = require('./db.js');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var initPassport = require('./passport/init');
var flash = require('connect-flash');
initPassport(passport);
var routes = require('./routes/index.js')(passport);
var recaptcha_async = require('recaptcha-async');
var recaptcha = new recaptcha_async.reCaptcha();
var gridfs = require('./routes/gridfs');
var Schema = mongoose.Schema;
var jsonParser = express.json();
var GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const locationController = require('./controllers/locations');

var indexRouter = require('./routes/index')(passport);
const mongouri = 'mongodb://localhost:27017/userssessions'
var mongoDB = mongoose.connect('mongodb://localhost:27017/userssessions');
mongoose.Promise = require('bluebird');
var db = mongoose.connection;
Grid.mongo = mongoose.mongo;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const conn = mongoose.createConnection(mongouri);
let gfs;

conn.once('open', function () {

  gfs = Grid(conn.db);
  gfs.collection('userdocs');

});

var storage = new GridFsStorage ({
  url: mongouri,
  file: (req, file) => {
    return new Promise((resolve,reject) =>{
      crypto.randomBytes(16, (err, buf)=>{
  if(err) {
      return reject(err);
  }
  const filename = file.originalname;
  const fileinfo = {
      filename:filename,
      bucketName:'userdocs'
       };
      resolve(fileinfo);
   });
  }
  )}});

var upload = multer({ storage });


var urlencodedParser = bodyParser.urlencoded({extended: true});

var app = express();

app.use(cookieParser());
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: 'mongodb://localhost:27017/savedsessions'
  })
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.post('/register', function(req, res, next) {
        var recaptcha = new recaptcha_async.reCaptcha();

        // Eventhandler that is triggered by checkAnswer()
        recaptcha.on('data', function (recaptcha_response) {
                res.render('layout', {
                        layout: 'layout.pug',
                        locals: {
                                recaptcha: recaptcha_response.is_valid ? 'valid' : 'invalid'
                                }
                });
        });

        // Check the user response by calling the google servers
        // and sends a 'data'-event
        recaptcha.checkAnswer('6LcfN_IZAAAAAPBwY0FTArVx-AohXtBYmYDhOUYM',  // private reCaptchakey (invalidated)
                          req.connection.remoteAddress,
                          req.body.recaptcha_challenge_field,
                          req.body.recaptcha_response_field);
});
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

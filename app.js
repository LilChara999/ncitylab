var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
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

var indexRouter = require('./routes/index')(passport);
var mongoDB = mongoose.connect('mongodb://localhost:27017/userssessions');
mongoose.Promise = require('bluebird');
var db = mongoose.connection;
Grid.mongo = mongoose.mongo;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var gfs;

db.once('open', function () {

    gfs = Grid(db.db);

});

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
app.use(flash())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


//объявление bodyParser для обработки комментариев
var urlencodedParser = bodyParser.urlencoded({extended: false});

// Upload a file from loca file-system to MongoDB
app.get('/files/upload',  function(req, res) {
  var filename = req.query.filename;

  var writestream = gfs.createWriteStream({ filename: filename });
  fs.createReadStream(__dirname + '/files/' + filename).pipe(writestream);
  writestream.on('close', function (file) {
      res.send('Stored File: ' + file.filename);
  });
});

// Download a file from MongoDB - then save to local file-system
app.get('/files/download', function (req, res) {
    // Check file exist on MongoDB

var filename = req.query.filename;

    gfs.exist({ filename: filename }, function (err, file) {
        if (err || !file) {
            res.status(404).send('File Not Found');
    return
        }

  var readstream = gfs.createReadStream({ filename: filename });
  readstream.pipe(res);
    });
});

// Delete a file from MongoDB
app.get('/files/delete', function (req, res) {

  var filename = req.query.filename;

  gfs.exist({ filename: filename }, function (err, file) {
    if (err || !file) {
      res.status(404).send('File Not Found');
      return;
  }

    gfs.remove({ filename: filename }, function (err) {
      if (err) res.status(500).send(err);
      res.send('File Deleted');
    });
  });
});

// Get file information(File Meta Data) from MongoDB
app.get('/files/meta', function (req, res) {

var filename = req.query.filename;

gfs.exist({ filename: filename }, function (err, file) {
  if (err || !file) {
    res.send('File Not Found');
    return;
  }

  gfs.files.find({ filename: filename }).toArray( function (err, files) {
    if (err) res.send(err);
    res.json(files);
  });
});
});

//объявление db для хранения комментариев
//var commentsdb = 'mongodb://localhost:27017/userssessions';
//mongoose.connect(dbConfig.url, {
  //useMongoClient: true
//});
//mongoose.Promise = require('bluebird');
//var comdb = mongoose.connection;
//comdb.on('error', console.error.bind(console, 'MongoDB connection error:'));

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

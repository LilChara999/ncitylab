var express = require('express');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var db = mongoose.connection;
var gfs;
var app = express();

db.once('open', function () {

  gfs = Grid(db.db);

});

exports.upload = function (req, res) {
  var filename = req.query.filename;
  var writestream = gfs.createWriteStream({ filename: filename });
  fs.createReadStream('files/' + filename).pipe(writestream);
  writestream.on('close', function (file) {
    res.send('Stored File: ' + file.filename);
  });
}

exports.download = function (req, res) {
  var fileid = req.query.id;
  var filename = req.query.filename;
  gfs.exist({ fileid: fileid }, function (err, file) {
      if (err || !file) {
          res.status(404).send('File Not Found');
  return
      }
  var readstream = gfs.createReadStream({ fileid: fileid });
  readstream.pipe(res);
  });
}

exports.delete =  function (req, res) {
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
};

exports.meta = function (req, res) {
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
};

const path = require('path');
const Location = require('../models/location');
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


exports.create = function (req, res) {
    var newLocation = new Location({name: req.body.name, desc: req.body.desc, file: req.file.id});
    name = req.body.name;
    desc = req.body.desc;
    file = req.file.id;
    console.log(name, desc, file);
    newLocation.save(function (err) {
            if(err) {
              console.error('Ошибка:', err);
        } else {
            res.redirect('back');
            console.log('Локация успешно создана!');
  }});
};

exports.list = async (req, res) => {
  var locationImage = Location.findOne({name: req.params.name}, function(err, location) {
    gfs.collection('userdocs');
    var readstream = gfs.createReadStream(location.file);
    readstream.on("error", function(err){
      console.error(err);
    });
    readstream.pipe(res);
    }
  )
  const location = Location.findOne({name: req.params.name}, function(err, location) {
    res.render('locations', {name: location.name, desc: location.desc})
  })
};

exports.image = function (req, res) {
  const location = Location.findOne({name: req.params.name}, function(err, location) {
    gfs.collection('userdocs');
    var readstream = gfs.createReadStream(location.file);
    readstream.on("error", function(err){
      console.error(err);
    });
    readstream.pipe(res);
    }
  )
};

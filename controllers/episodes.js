const path = require('path');
const Episode = require('../models/episode');
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
    var newEpisode = new Episode({ename: req.body.ename, desc: req.body.desc, weather: req.body.weather, file: req.file.id});
    ename = req.body.ename;
    desc = req.body.desc;
    weather = req.body.weather;
    file = req.file.id;
    console.log(ename, desc, weather, file);
    newEpisode.save(function (err) {
            if(err) {
              console.error('Ошибка:', err);
        } else {
            res.redirect('back');
            console.log('Локация успешно создана!');
  }});
};

exports.list = async (req, res) => {
  var episodeImage = Episode.findOne({ename: req.params.ename}, function(err, episode) {
    gfs.collection('userdocs');
    var readstream = gfs.createReadStream(episode.file);
    readstream.on("error", function(err){
      console.error(err);
    });
    readstream.pipe(res);
    }
  )
  const episode = Episode.findOne({ename: req.params.ename}, function(err, episode) {
    res.render('episodes', {ename: episode.ename, desc: episode.desc, weather: episode.weather})
  })
};

exports.image = function (req, res) {
  const episode = Episode.findOne({ename: req.params.ename}, function(err, episode) {
    gfs.collection('userdocs');
    var readstream = gfs.createReadStream(episode.file);
    readstream.on("error", function(err){
      console.error(err);
    });
    readstream.pipe(res);
    }
  )
};

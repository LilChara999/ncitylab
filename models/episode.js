const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Episode = new Schema({
  ename: {type :String, required: true},
  desc: {type: String, required: true},
  weather: {type: String, required: true},
  file: {type: mongoose.Schema.Types.ObjectId, ref: 'userdocs', required: true}
});

module.exports = mongoose.model('Episode', Episode)

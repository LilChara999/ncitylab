const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Location = new Schema({
  name: {type :String, required: true},
  desc: {type: String, required: true},
  file: {type: mongoose.Schema.Types.ObjectId, ref: 'userdocs', required: true}
});

module.exports = mongoose.model('Location', Location)

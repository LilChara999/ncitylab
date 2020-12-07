var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id: String,
	username: {type: String, unique: true},
	password: String,
	email: {type: String, unique: true},
	role: {type: String, default: "user"}
});

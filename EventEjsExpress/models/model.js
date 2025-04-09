const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    image : String,
    createdBy: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = { User, Event };
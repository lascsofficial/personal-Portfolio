const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const mongodb_uri = 'mongodb://127.0.0.1:27017/protfoilo';

const connectDB = async () => {
    try {
        await mongoose.connect(mongodb_uri);
        console.log('MongoDB connected...'); 
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

 


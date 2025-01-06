const mongoose = require('mongoose');
const Category = require('./Category'); // Import the Category model

// Define Skill Schema
const skillSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    skill: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
});

module.exports = mongoose.model('Skill', skillSchema);

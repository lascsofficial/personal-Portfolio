const mongoose = require('mongoose');

// Import Category Model
const Category = require('./Category'); 

const skillSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true, // Ensures an image is uploaded for each skill
        trim: true,     // Cleans up file paths
    },
    skill: {
        type: String,
        required: true,
        trim: true,     // Keeps skill names clean
    },
    level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], // Ensures valid values
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to Category model
        required: true,
    },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

// Export the model
module.exports = mongoose.model('Skill', skillSchema);

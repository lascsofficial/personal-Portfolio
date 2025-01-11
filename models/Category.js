const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate category names
        trim: true,   // Removes extra spaces
    },
    description: {
        type: String,
        trim: true,   // Ensures clean input
    },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

// Export the model
module.exports = mongoose.model('Category', categorySchema);

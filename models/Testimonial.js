const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: String,
    testimonial: String,
    imageUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    // Other fields as needed
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;

const mongoose = require('mongoose');

// Define blog post schema
const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    contentUrl: {
        type: String,
        required: true
    }
});

// Create a model
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;

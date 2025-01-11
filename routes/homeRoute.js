const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import Models
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const BlogPost = require('../models/BlogPost');

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user; // Attach user data to request
        next();
    });
};

// Data Fetch Function
const getData = async () => {
    try {
        const [posts, categories, projects, testimonials] = await Promise.all([
            BlogPost.find(),
            Category.find(),
            Project.find(),
            Testimonial.find(),
        ]);

        const skillsByCategory = await Skill.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: '$categoryDetails' },
            {
                $group: {
                    _id: '$categoryDetails.name',
                    skills: {
                        $push: {
                            name: '$skill',
                            level: '$level',
                            levelPercentage: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ['$level', 'Beginner'] }, then: 25 },
                                        { case: { $eq: ['$level', 'Intermediate'] }, then: 50 },
                                        { case: { $eq: ['$level', 'Advanced'] }, then: 75 },
                                        { case: { $eq: ['$level', 'Expert'] }, then: 100 },
                                    ],
                                    default: 0,
                                },
                            },
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return { posts, categories, projects, testimonials, skillsByCategory };
    } catch (err) {
        console.error('Error fetching data:', err);
        throw new Error('An error occurred while fetching data.');
    }
};

// Public Routes
router.get('/', async (req, res) => {
    try {
        const data = await getData();
        res.render('index', {
            posts: data.posts,
            categories: data.categories,
            projects: data.projects,
            testimonials: data.testimonials,
            skillsByCategory: data.skillsByCategory,
            User: req.user || null, // Include user details if authenticated
        });
    } catch (err) {
        res.status(500).send('An error occurred while fetching data.');
    }
});

router.get('/about', (req, res) => {
    res.send('about');
});

// Protected Routes
router.get('/skills', authenticateJWT, async (req, res) => {
    try {
        const data = await getData();
        res.render('skills', { skillsByCategory: data.skillsByCategory });
    } catch (err) {
        res.status(500).send('An error occurred while fetching data.');
    }
});

router.get('/projects', authenticateJWT, async (req, res) => {
    try {
        const data = await getData();
        res.render('projects', { projects: data.projects });
    } catch (err) {
        res.status(500).send('An error occurred while fetching data.');
    }
});

router.get('/testimonials', authenticateJWT, async (req, res) => {
    try {
        const data = await getData();
        res.render('testimonials', { testimonials: data.testimonials });
    } catch (err) {
        res.status(500).send('An error occurred while fetching data.');
    }
});

router.get('/blog', authenticateJWT, async (req, res) => {
    try {
        const data = await getData();
        res.render('blog', { posts: data.posts });
    } catch (err) {
        res.status(500).send('An error occurred while fetching data.');
    }
});

module.exports = router;

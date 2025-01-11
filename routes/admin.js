const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import Models
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Middleware to Fetch Categories for Forms
const fetchCategories = async (req, res, next) => {
    try {
        res.locals.categories = await Category.find({});
        next();
    } catch (error) {
        next(error);
    }
};

// Helper Functions
const handleError = (res, error, redirectUrl = '/admin') => {
    console.error('Error:', error);
    res.redirect(redirectUrl);
};

const saveOrUpdateDocument = async (Model, filter, updateData, res, redirectUrl) => {
    try {
        await Model.findOneAndUpdate(filter, updateData, { upsert: true, new: true });
        res.redirect(redirectUrl);
    } catch (error) {
        handleError(res, error, redirectUrl);
    }
};

// Admin Dashboard Route
router.get('/', async (req, res, next) => {
    try {
        const [projects, skills, testimonials, blogPosts, categories] = await Promise.all([
            Project.find({}),
            Skill.find({}).populate('category'),
            Testimonial.find({}),
            BlogPost.find({}),
            Category.find({}),
        ]);

        res.render('admin', {
            aboutContent: "Your About Content Here",
            projects,
            skills,
            testimonials,
            blogPosts,
            categories,
        });
    } catch (error) {
        next(error);
    }
});

/* =========================
   ABOUT SECTION ROUTES
   ========================= */
router.post('/about', async (req, res) => {
    const { content } = req.body;
    saveOrUpdateDocument(
        require('../models/About'),
        {},
        { content },
        res,
        '/admin'
    );
});

/* =========================
   PROJECTS SECTION ROUTES
   ========================= */
router.post('/projects/add', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const newProject = new Project({
        title,
        description,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        contentUrl: '#', // Update as needed
    });

    try {
        await newProject.save();
        res.redirect('/admin#projects');
    } catch (error) {
        handleError(res, error, '/admin#projects');
    }
});

router.post('/projects/edit/:id', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const updateData = {
        title,
        description,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    };

    saveOrUpdateDocument(Project, { _id: req.params.id }, updateData, res, '/admin#projects');
});

router.post('/projects/delete', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.body.id);
        res.redirect('/admin#projects');
    } catch (error) {
        handleError(res, error, '/admin#projects');
    }
});

/* =========================
   SKILLS SECTION ROUTES
   ========================= */
router.post('/skills/add', upload.single('image'), async (req, res) => {
    const { skill, level, category } = req.body;

    try {
        const categoryDoc = await Category.findOneAndUpdate(
            { name: category },
            { name: category },
            { upsert: true, new: true }
        );

        const newSkill = new Skill({
            skill,
            level,
            levelPercentage: { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 }[level] || 0,
            category: categoryDoc._id,
            image: req.file ? `/uploads/${req.file.filename}` : '',
        });

        await newSkill.save();
        res.redirect('/admin#skills');
    } catch (error) {
        handleError(res, error, '/admin#skills');
    }
});

router.post('/skills/edit/:id', upload.single('image'), async (req, res) => {
    const { skill, level, category } = req.body;

    try {
        const categoryDoc = await Category.findOneAndUpdate(
            { name: category },
            { name: category },
            { upsert: true, new: true }
        );

        const updateData = {
            skill,
            level,
            levelPercentage: { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 }[level] || 0,
            category: categoryDoc._id,
            image: req.file ? `/uploads/${req.file.filename}` : undefined,
        };

        await Skill.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin#skills');
    } catch (error) {
        handleError(res, error, '/admin');
    }
});

router.post('/skills/delete', async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.body.id);
        res.redirect('/admin#skills');
    } catch (error) {
        handleError(res, error, '/admin#skills');
    }
});

/* =========================
   GENERIC DELETE HANDLER
   ========================= */
router.post('/:type/delete', async (req, res) => {
    const { id } = req.body;
    const Model = {
        testimonials: Testimonial,
        blog: BlogPost,
        categories: Category,
    }[req.params.type];

    if (!Model) return res.status(400).send('Invalid type.');

    try {
        await Model.findByIdAndDelete(id);
        res.redirect(`/admin#${req.params.type}`);
    } catch (error) {
        handleError(res, error, `/admin#${req.params.type}`);
    }
});

module.exports = router;

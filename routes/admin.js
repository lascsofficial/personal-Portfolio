// routes/admin.js

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

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1634239083940.jpg
    },
});

const upload = multer({ storage: storage });

// Middleware to fetch categories for forms
const fetchCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.locals.categories = categories;
        next();
    } catch (error) {
        next(error);
    }
};

// Admin Dashboard Route
router.get('/', async (req, res, next) => {
    try {
        const aboutContent = "Your About Content Here"; // Fetch from DB or config
        const projects = await Project.find({});
        const skills = await Skill.find({}).populate('category'); // Populate category name
        const testimonials = await Testimonial.find({});
        const blogPosts = await BlogPost.find({});
        const categories = await Category.find({});

        res.render('admin', {
            aboutContent,
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

// Update About Section
router.post('/about', async (req, res, next) => {
    try {
        const { content } = req.body;
        // Assuming you have an About model or store it in a config
        // For simplicity, let's assume it's stored in a single document
        let about = await About.findOne({});
        if (!about) {
            about = new About({ content });
        } else {
            about.content = content;
        }
        await about.save();
        res.redirect('/admin');
    } catch (error) {
        next(error);
    }
});

/* =========================
   PROJECTS SECTION ROUTES
   ========================= */

// Add New Project
router.post('/projects/add', upload.single('image'), async (req, res, next) => {
    try {
        const { title, description } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const newProject = new Project({
            title,
            description,
            imageUrl,
            contentUrl: '#', // Update as needed
        });
        await newProject.save();
        res.redirect('/admin#projects');
    } catch (error) {
        next(error);
    }
});

// Edit Project
router.post('/projects/edit/:id', upload.single('image'), async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { title, description } = req.body;
        const updateData = { title, description };

        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        await Project.findByIdAndUpdate(projectId, updateData);
        res.redirect('/admin#projects');
    } catch (error) {
        next(error);
    }
});

// Delete Project
router.post('/projects/delete', async (req, res, next) => {
    try {
        const { id } = req.body;
        await Project.findByIdAndDelete(id);
        res.redirect('/admin#projects');
    } catch (error) {
        next(error);
    }
});

/* =========================
   SKILLS SECTION ROUTES
   ========================= */

// Add New Skill
router.post('/skills/add', upload.single('image'), async (req, res, next) => {
    try {
        const { skill, level, category } = req.body;
        let categoryId;

        // Find or create the category
        const categoryDoc = await Category.findOne({ name: category });
        if (categoryDoc) {
            categoryId = categoryDoc._id;
        } else {
            const newCategory = new Category({ name: category });
            const savedCategory = await newCategory.save();
            categoryId = savedCategory._id;
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const newSkill = new Skill({
            image: imageUrl,
            skill,
            level,
            category: categoryId,
        });
        await newSkill.save();
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

// Edit Skill
router.post('/skills/edit/:id', upload.single('image'), async (req, res, next) => {
    try {
        const skillId = req.params.id;
        const { skill, level, category } = req.body;
        let categoryId;

        // Find or create the category
        const categoryDoc = await Category.findOne({ name: category });
        if (categoryDoc) {
            categoryId = categoryDoc._id;
        } else {
            const newCategory = new Category({ name: category });
            const savedCategory = await newCategory.save();
            categoryId = savedCategory._id;
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Convert level to percentage for progress bar
        const levelMapping = {
            Beginner: 25,
            Intermediate: 50,
            Advanced: 75,
            Expert: 100,
        };
        const levelPercentage = levelMapping[level] || 0;

        const updateData = {
            skill,
            level,
            levelPercentage,
            category: categoryId,
        };
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        await Skill.findByIdAndUpdate(skillId, updateData);
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

// Delete Skill
router.post('/skills/delete', async (req, res, next) => {
    try {
        const { id } = req.body;
        await Skill.findByIdAndDelete(id);
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

/* =========================
   TESTIMONIALS SECTION ROUTES
   ========================= */

// Add New Testimonial
router.post('/testimonials/add', async (req, res, next) => {
    try {
        const { content, clientName } = req.body;
        const newTestimonial = new Testimonial({
            content,
            clientName,
        });
        await newTestimonial.save();
        res.redirect('/admin#testimonials');
    } catch (error) {
        next(error);
    }
});

// Edit Testimonial
router.post('/testimonials/edit/:id', async (req, res, next) => {
    try {
        const testimonialId = req.params.id;
        const { content, clientName } = req.body;

        await Testimonial.findByIdAndUpdate(testimonialId, { content, clientName });
        res.redirect('/admin#testimonials');
    } catch (error) {
        next(error);
    }
});

// Delete Testimonial
router.post('/testimonials/delete', async (req, res, next) => {
    try {
        const { id } = req.body;
        await Testimonial.findByIdAndDelete(id);
        res.redirect('/admin#testimonials');
    } catch (error) {
        next(error);
    }
});

/* =========================
   BLOG SECTION ROUTES
   ========================= */

// Add New Blog Post
router.post('/blog/add', upload.single('image'), async (req, res, next) => {
    try {
        const { title, description, contentUrl } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const newBlogPost = new BlogPost({
            title,
            description,
            imageUrl,
            contentUrl,
        });
        await newBlogPost.save();
        res.redirect('/admin#blog');
    } catch (error) {
        next(error);
    }
});

// Edit Blog Post
router.post('/blog/edit/:id', upload.single('image'), async (req, res, next) => {
    try {
        const blogPostId = req.params.id;
        const { title, description, contentUrl } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const updateData = { title, description, contentUrl };
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        await BlogPost.findByIdAndUpdate(blogPostId, updateData);
        res.redirect('/admin#blog');
    } catch (error) {
        next(error);
    }
});

// Delete Blog Post
router.post('/blog/delete', async (req, res, next) => {
    try {
        const { id } = req.body;
        await BlogPost.findByIdAndDelete(id);
        res.redirect('/admin#blog');
    } catch (error) {
        next(error);
    }
});

/* =========================
   CATEGORIES SECTION ROUTES
   ========================= */

// Add New Category
router.post('/categories/add', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            // Handle duplicate category name
            // You can redirect with a flash message or handle as needed
            return res.redirect('/admin#skill');
        }
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

// Edit Category
router.post('/categories/edit/:id', async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;
        await Category.findByIdAndUpdate(categoryId, { name, description });
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

// Delete Category
router.post('/categories/delete', async (req, res, next) => {
    try {
        const { id } = req.body;
        // Optionally, handle cascading deletes or prevent deletion if skills are associated
        await Category.findByIdAndDelete(id);
        res.redirect('/admin#skill');
    } catch (error) {
        next(error);
    }
});

module.exports = router;

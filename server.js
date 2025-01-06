const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const BlogPost = require('./models/BlogPost'); 
const Skill = require('./models/Skill'); 
const Category = require('./models/Category');
const Project = require('./models/Project');
const Testimonials = require ('./models/Testimonial')
const adminRoutes = require('./routes/admin');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

connectDB();

const app = express();
const port = 3000;

// Set view engine to EJS
app.set('views', './views');
app.set('view engine', 'ejs');

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dynamic Skill Level Map
const skillLevelMap = {
    Beginner: 25,
    Intermediate: 50,
    Advanced: 75,
    Expert: 100
};

app.use('/admin', adminRoutes);

// Route to fetch blog posts and skills
app.get('/', async (req, res) => {
    try {
        const posts = await BlogPost.find();
        let skills = await Skill.find();
        const categories = await Category.find();
        const projects = await Project.find();
        const testimonials = await Testimonials.find();

        skills = skills.map(skill => ({
            ...skill.toObject(),
            levelPercentage: skillLevelMap[skill.level] || 0
        }));

        res.render('index', { posts, skills, categories, projects,testimonials });
    } catch (err) {
        res.status(500).send('Error fetching data');
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

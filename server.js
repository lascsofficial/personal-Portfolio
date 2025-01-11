require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const authenticateJWT=require('./Middleware/authMiddleware');

// Initialize Express App
const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Ensure 'uploads' Directory Exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValidType = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
        isValidType ? cb(null, true) : cb(new Error('Only image files are allowed.'));
    },
});

// Error Handling for File Uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Only image files are allowed.') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

app.use(authenticateJWT);


// Routes
app.use('/admin', authenticateJWT, require('./routes/admin')); // Protect admin routes
app.use('/', require('./routes/homeRoute'));
app.use('/auth', require('./routes/auth'));

// 404 Error Handling
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

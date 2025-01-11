const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jwt library
const mongoose = require('mongoose');
const User = require('../models/User');

// Authentication Routes

// Render the authentication page
router.get('/', (req, res) => {
    res.render('auth', { message: null }); // Ensure 'auth.ejs' file exists in the 'views' folder
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).render('auth', { message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).render('auth', { message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email }, 
            process.env.JWT_SECRET||'jjejkejjejej',  // You should set this in your .env file
            { expiresIn: '1h' }     // Token expiration time (1 hour in this example)
        );

        // Send token as response (you can also store it in a cookie or localStorage on the client side)
        return res.json({ token });

    } catch (err) {
        console.error(err.message);
        return res.status(500).render('auth', { message: 'An error occurred. Please try again.' });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('auth', { message: 'Email already exists' });
        }

        // Validate password (e.g., length and complexity)
        if (password.length < 6) {
            return res.status(400).render('auth', { message: 'Password must be at least 6 characters long' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({ name, email, password: hashedPassword });

        // Redirect to login with a success message
        return res.status(201).render('auth', { message: 'User created successfully. Please log in.' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).render('auth', { message: 'An error occurred. Please try again.' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // You don't need to destroy the session in JWT implementation, as the token is stateless.
    // However, you can delete the JWT token from the client side (in cookies/localStorage).
    res.redirect('/auth');
});

module.exports = router;

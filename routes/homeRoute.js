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


const express = require('express');
const router = express.Router();

const User = require('../models/userModel');
const Book = require('../models/bookModel');

const { ensureAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', ensureAuth, userController.getUserProfile);

module.exports=router;
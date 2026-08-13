const express = require('express');
const router = express.Router();

const Book = require('../models/bookModel');
const User = require('../models/userModel');

const bookController = require('../controllers/bookController');

router.get('/:id', bookController.getBookDetails);

router.post('/:bookId/like', bookController.likeBook);
router.post('/:bookId/bookmark', bookController.bookmarkBook);

router.post('/:bookId/comment', bookController.addComment);
router.post('/:bookId/comment/:commentId/like', bookController.likeComment);
router.delete('/:bookId/comment/:commentId', bookController.deleteComment);
router.put('/:bookId/comment/:commentId', bookController.editComment);
router.post('/:bookId/comment/:commentId/reply', bookController.replyToComment);



module.exports = router;
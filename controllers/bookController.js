const Book = require('../models/bookModel');
const User = require('../models/userModel');


exports.getBookDetails = async (req, res) => {
    const bookId = req.params.id;
    try {
        const currentBookResponse = await fetch(`https://gutendex.com/books/${bookId}`);
        const bookData = await currentBookResponse.json();

        const moreBooksResponse = await fetch('https://gutendex.com/books');
        const moreBooksData = await moreBooksResponse.json();

        const similarBooks = moreBooksData.results.filter(b => b.id.toString() !== bookId.toString()).slice(0, 5);

        let localBook = await Book.findOne({ bookId: bookId }).populate({
            path: 'comments.user',
            select: 'name profilePhoto'
        }).populate({
            path: 'comments.replies.user',
            select: 'name profilePhoto'
        });

        let comments = [];
        if (localBook && localBook.comments) {
            comments = localBook.comments.sort((a, b) => b.likes.length - a.likes.length);
        }

        let userLikedBook = false;
        let userBookmarkedBook = false;

        if (req.user && localBook) {
            const user = await User.findById(req.user._id);
            if (user) {
                userLikedBook = user.likedBooks.some(id => id.toString() === localBook._id.toString());
                userBookmarkedBook = user.bookmarks.some(id => id.toString() === localBook._id.toString());
            }
        }

        res.render('bookDetails', {
            book: bookData,
            similarBooks: similarBooks,
            localBook: localBook,
            comments: comments,
            userLikedBook: userLikedBook,             
            userBookmarkedBook: userBookmarkedBook
        });
    } catch (error) {
        res.send('Error loading book detail.');
    }
};

exports.likeBook = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'You must be logged in.' });
        }
        const gutendexId = req.params.bookId;
        const { title, author } = req.body;

        let book = await Book.findOne({ bookId: gutendexId });
        if (!book) {
            book = new Book({
                bookId: gutendexId,
                title: title,
                author: author
            });
            await book.save();
        }

        const user = await User.findById(req.user._id);
        const userLikes = user.likedBooks || [];
        const hasLiked = userLikes.includes(book._id);
        if (hasLiked) {
            await User.findByIdAndUpdate(user._id, { $pull: { likedBooks: book._id } });
            await Book.findByIdAndUpdate(book._id, { $pull: { likedBy: user._id }, $inc: { likesCount: -1 } });
        } else {
            await User.findByIdAndUpdate(user._id, { $addToSet: { likedBooks: book._id } });
            await Book.findByIdAndUpdate(book._id, { $addToSet: { likedBy: user._id }, $inc: { likesCount: 1 } });
        }
        res.json({ success: true, hasLiked: !hasLiked });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

exports.bookmarkBook = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'You must be logged in.' });
        }
        const gutendexId = req.params.bookId;
        const { title, author } = req.body;

        let book = await Book.findOne({ bookId: gutendexId });
        if (!book) {
            book = new Book({
                bookId: gutendexId,
                title: title,
                author: author
            });
            await book.save();
        }

        const user = await User.findById(req.user._id);
        const userBookmarks = user.bookmarks || [];
        const hasBookmarked = userBookmarks.includes(book._id);

        if (hasBookmarked) {
            await User.findByIdAndUpdate(user._id, { $pull: { bookmarks: book._id } });
        } else {
            await User.findByIdAndUpdate(user._id, { $addToSet: { bookmarks: book._id } });
        }

        await user.save();
        res.json({ success: true, hasBookmarked: !hasBookmarked });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

exports.addComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Please log in to comment.' });

        const { text, title, author } = req.body;
        if (!text || text.trim() === '') return res.status(400).json({ error: 'Comment cannot be empty.' });

        let book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            book = new Book({ bookId: req.params.bookId, title, author });
        }

        book.comments.push({
            user: req.user._id,
            text: text.trim()
        });

        await book.save();

        const io = req.app.get('io');
        if (io) {
            io.to(req.params.bookId).emit('new-comment');
        }

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Error posting comment' }); }
};

exports.likeComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Please log in to like comments.' });

        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) return res.status(404).json({ error: 'Book not found.' });

        const comment = book.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found.' });

        if (!comment.likes) {
            comment.likes = [];
        }

        const hasLiked = comment.likes.includes(req.user._id);

        if (hasLiked) {
            comment.likes.pull(req.user._id);
        } else {
            comment.likes.push(req.user._id);

            if (comment.user && comment.user.toString() !== req.user._id.toString()) {
                const commentOwner = await User.findById(comment.user);

                if (commentOwner) {
                    if (!commentOwner.notifications) {
                        commentOwner.notifications = [];
                    }

                    commentOwner.notifications.push({
                        type: 'like',
                        message: `${req.user.name} liked your review of ${book.title}.`,
                        link: `/book/${book.bookId}`
                    });
                    await commentOwner.save();

                    const io = req.app.get('io');
                    if (io) {
                        io.to(commentOwner._id.toString()).emit('new-notification', {
                            message: `${req.user.name} liked your review of ${book.title}.`,
                            link: `/book/${book.bookId}`
                        });
                    }
                }
            }
        }

        await book.save();

        const io = req.app.get('io');
        if (io) {
            io.to(req.params.bookId).emit('update-like', {
                commentId: req.params.commentId,
                likesCount: comment.likes.length
            });
        }

        res.json({ success: true, likesCount: comment.likes.length, hasLiked: !hasLiked });
    } catch (err) {
        console.error("CRITICAL ERROR LIKING COMMENT:", err);
        res.status(500).json({ error: 'Error liking comment' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Please log in.' });

        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) return res.status(404).json({ error: 'Book not found' });

        const comment = book.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own comments.' });
        }

        book.comments.pull(req.params.commentId);
        await book.save();

        const io = req.app.get('io');
        if (io) io.to(req.params.bookId).emit('new-comment');

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting comment' });
    }
};

exports.editComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Please log in.' });

        const { text } = req.body;
        if (!text || text.trim() === '') return res.status(400).json({ error: 'Comment cannot be empty.' });

        const book = await Book.findOne({ bookId: req.params.bookId });
        const comment = book.comments.id(req.params.commentId);

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only edit your own comments.' });
        }

        comment.text = text.trim();
        comment.isEdited = true;
        await book.save();

        const io = req.app.get('io');
        if (io) io.to(req.params.bookId).emit('new-comment');

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error editing comment' });
    }
};

exports.replyToComment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Please log in.' });

        const { text } = req.body;
        if (!text || text.trim() === '') return res.status(400).json({ error: 'Reply cannot be empty.' });

        const book = await Book.findOne({ bookId: req.params.bookId });
        const comment = book.comments.id(req.params.commentId);

        if (!comment) return res.status(404).json({ error: 'Original comment not found.' });

        comment.replies.push({
            user: req.user._id,
            text: text.trim()
        });

        await book.save();

        const io = req.app.get('io');
        if (io) io.to(req.params.bookId).emit('new-comment');

        let targetUserId = comment.user;
        if (text.includes('@')) {
            const possibleName = text.split('@')[1].split(' ')[0];

            const taggedUser = await User.findOne({ name: { $regex: new RegExp(`^${possibleName}`, 'i') } });

            if (taggedUser) {
                targetUserId = taggedUser._id;
            }
        }

        if (targetUserId.toString() !== req.user._id.toString()) {
            const recipient = await User.findById(targetUserId);

            if (recipient) {
                if (!recipient.notifications) recipient.notifications = [];

                recipient.notifications.push({
                    type: 'reply',
                    message: `${req.user.name} replied to you on ${book.title}.`,
                    link: `/book/${book.bookId}`
                });
                await recipient.save();

                if (io) {
                    io.to(recipient._id.toString()).emit('new-notification', {
                        message: `${req.user.name} replied to you on ${book.title}.`,
                        link: `/book/${book.bookId}`
                    });
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error posting reply' });
    }
};
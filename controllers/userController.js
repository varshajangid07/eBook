const User = require('../models/userModel');


exports.getUserProfile = async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    try{
        const populatedUser=await User.findById(req.user._id).populate('likedBooks').populate('bookmarks').populate('recentReads');
        res.render('profile', { currentUser: populatedUser });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}
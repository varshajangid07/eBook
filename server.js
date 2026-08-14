// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const MongoStore = require('connect-mongo').default;

const User = require('./models/userModel');

require('dotenv').config();
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 2000;

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

io.on('connection', (socket) => {
    socket.on('join-book', (bookId) => {
        socket.join(bookId); 
    });

    socket.on('join-user', (userId) => {
        socket.join(userId);
    });
});

mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB."))
    .catch(err => console.log("MongoDB connection error : ", err));

const bookRoute = require('./routes/bookRoute');
const userRoute = require('./routes/userRoute');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI
    }),
    cookie: { 
        secure: false
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
    if (req.user) {
        try {
            const freshUser = await User.findById(req.user._id);
            res.locals.currentUser = freshUser;
        } catch (err) {
            console.error("Error fetching user for locals:", err);
            res.locals.currentUser = req.user;
        }
    } else {
        res.locals.currentUser = null;
    }
    next();
});

app.post('/notifications/read', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await User.updateOne(
            { _id: req.user._id },
            { $set: { "notifications.$[].isRead": true } }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/signUp', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/signUp', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.render('signup', { error: 'Email already exists. Please log in.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        
        await user.save();
        res.redirect('/login');
    } catch(err) {
        console.log(err);
        res.redirect('/signUp');
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => {
        res.redirect('/'); 
    }
);

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/', async (req, res) => {
    try {
        const targetUrl = encodeURIComponent('https://gutendex.com/books');
        const response = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        const topFiveBooks = data.results.slice(0, 5);
        res.render('index', { trendingBooks: topFiveBooks });
    } catch (error) {
        console.error('Error Fetching books : ', error);
        res.render('index', { trendingBooks: [] });
    }
});

app.use('/book', bookRoute);
app.use('/', userRoute);

app.get('/catalog', (req, res) => {
    res.render('catalog', { currentUser: req.user }); 
});

server.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
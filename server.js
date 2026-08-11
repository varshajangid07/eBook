process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('./models/userModel');

require('dotenv').config();
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 2000;

mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB."))
    .catch(err => console.log("MongoDB connection error : ", err));

const bookRoute = require('./routes/bookRoute');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    next();
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
            return res.send('Email already exists.');
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

app.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('profile');
});



app.get('/', async (req, res) => {
    try {
        const response = await fetch('https://gutendex.com/books');
        const data = await response.json();
        const topFiveBooks = data.results.slice(0, 5);
        res.render('index', { trendingBooks: topFiveBooks });
    } catch (error) {
        console.error('Error Fetching books : ', error);
        res.send('Error loading the eBook library.');
    }
});

app.use('/book', bookRoute);

app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
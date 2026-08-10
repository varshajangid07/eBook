process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
require('dotenv').config();

const app=express();
const PORT=process.env.PORT || 2000;

const bookRoute=require('./routes/bookRoute');

app.set('view engine', 'ejs');
app.use(express.static('public'));

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

})

app.use('/book', bookRoute);

app.listen(PORT, ()=>{
    console.log(`app is running at ${PORT}.`);
})
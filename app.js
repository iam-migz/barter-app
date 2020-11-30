const { render } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const morgan = require('morgan');



const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

// middleware ---
// static files
app.use(express.static('public'));

// takes json data from request and parses it into a javascript object, => body.req, auth
app.use(express.json());

// body parser, for accepting form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan('dev'));

// register view engine 
app.set('view engine', 'ejs'); 
// ejs will look for the views folder by default




// connect to mongodb (default connection) @ mongoose.connection
mongoose.connect(process.env.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) =>{
        app.listen(process.env.PORT);
        console.log(`Port at ${process.env.PORT}`);
    })
    .catch((err) => console.log(err));



// routes
app.get('*', checkUser); // all routes

app.get('/', (req, res) => {
    res.redirect('/items');
});
app.get('/about', (req, res) => {
    res.render('about', { title: 'About Page' });
});

// item routes
app.use('/items',itemRoutes); // scoping

// auth routes
app.use(authRoutes);


// 404 page, using a middleware, 'catch-all' 
app.use((req, res) => {
    res.status(404).render('404');
});

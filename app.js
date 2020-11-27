const { render } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
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


// register view engine 
app.set('view engine', 'ejs'); 
// ejs will look for the views folder by default



// connect to mongodb
const dbURI = 'mongodb+srv://miguel:snowfall@nodetuts.hzgvu.mongodb.net/barter-app-db?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000))
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
    res.status(404).render('404', { title: '404' });
});

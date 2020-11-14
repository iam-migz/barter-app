const { render } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

// connect to mongodb
const dbURI = 'mongodb+srv://miguel:snowfall@nodetuts.hzgvu.mongodb.net/barter-app-db?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

// register view engine
app.set('view engine', 'ejs'); 
// ejs will look for the views folder by default

// middleware & static files
app.use(express.static('public'));


// body parser, for accepting form data
app.use(express.urlencoded({ extended: true }));


// routes
app.get('/', (req, res) => {
    // res.sendFile('./views/index.html', { root: __dirname });
    // res.render('index', { title: 'barter-shit' });
    res.redirect('/items');
});
app.get('/about', (req, res) => {
    // res.sendFile('./views/about.html', { root: __dirname });
    res.render('about', { title: 'About Page' });
});

// item routes
app.use('/items',itemRoutes); // scoping



// 404 page, using a middleware, 'catch-all' 
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});

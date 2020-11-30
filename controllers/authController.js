const User = require('../models/User');
const jwt = require('jsonwebtoken');
// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', username: '', password: '' };

    // user login---
    // incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if(err.message === 'incorrect password'){
        errors.password = 'incorrect passowrd';
    }

    // sign up--
    // duplicate error code
    if(err.code === 11000){
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if(err.message.includes('user validation failed')){
        // get only the values from the object
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}
// 3d, 24hr, 60min, 60s -- 3 days in seconds
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    // payload, secret, options
    console.log('nice',process.env.SECRET);
    return jwt.sign({ id }, process.env.SECRET , {
        expiresIn: maxAge
    });
}



module.exports.signup_get = (req, res) => {
    res.render('signup', { title: 'Sign up'});
}

module.exports.login_get = (req, res) => {
    res.render('login', { title: 'login' });
}

module.exports.signup_post = async (req, res) => {
    const { email, username, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.create({ email, username, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); // maxAge in cookie set in milisecs
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        // a login static method in created in the model
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); // maxAge in cookie set in milisecs
        res.status(200).json({ user: user._id });
    } 
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}


module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}
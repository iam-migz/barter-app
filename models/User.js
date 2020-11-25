const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'], // mongoose validation
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
});


// mongoose hooks-- hashing--
// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
    // !important 'this' refers to user instance
    
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email });
    
    if(user){ // check if user if is found or undefined
        // check hashed password
        const auth = await bcrypt.compare(password, user.password);
        if(auth){ // password is correct
            return user;
        } throw Error('incorrect password');
    } throw Error('incorrect email');
}



// create a model based on this Schema
// must be singular form of the collection e.i collection is users
const User = mongoose.model('user', userSchema);

module.exports = User;
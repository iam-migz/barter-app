const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 1,
        required: true
    },
    availability: {
        type: Boolean,
        required: true
    },
    filename: {
        type: String
    }
}, { timestamps: true });


// 1st param: will look for our items collection in db
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
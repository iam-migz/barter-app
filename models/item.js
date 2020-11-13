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
    price: {
        type: Number,
        min: 1,
        required: true
    }
}, { timestamps: true });

// 1st param: will look for our items collection in db
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
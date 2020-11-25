
const mongoose = require('mongoose');

const barterSchema = new mongoose.Schema({
    requestor: {
        type: String,
        required: true
    },
    requestee: {
        type: String,
        required: true
    },
    requestorProduct: {
        type: String,
        required: true
    },
    requesteeProduct: {
        type: String,
        required: true
    },
    message: {
        type: String  
    },
    response: {
        type: String,
        enum: ['pending', 'denied', 'accepted'],
        default: 'pending',
    }
}, { timestamps: true });


const Barter = mongoose.model('barter', barterSchema);
module.exports = Barter;
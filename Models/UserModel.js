const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    } ,
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    password_hash: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false // Set default value to false
    },
    is_blocked: {
        type: Boolean,
        default: false // Set default value to false

    },
    last_login: {
        type: Date,
    },
    rating: {
        type: String,
    },
    address: {
        type: String,
    },
    profileUrl: {
        type: String, 
    }
}, {timestamps: true});

module.exports = mongoose.model('Users', userSchema);


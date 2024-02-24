const { validationResult } = require('express-validator');
const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs'); // Node.js file system module
const path = require('path');
const { verify } = require('crypto');
// Set up multer to handle form data
const upload = multer();

exports.postRegister = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed! Please check your input data.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        // Hash the password
        const password = req.body.password;
        const { name, username, email, mobile, address } = req.body;

        const hashedPass = await bcrypt.hash(password, 12);
        const user = new User({
            user_id: new Date().toISOString(),
            name: name,
            username: username,
            email: email,
            mobile: mobile,
            password_hash: hashedPass, // Store the hashed password
            address: address,
        });
        const result = await user.save();
        res.status(200).json({
            message: "User Registered successfully!",
            user: result._id,
        });
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }
 
};

exports.postLogin = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed! Please check your input data.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        // Hash the password
        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;
        const user = await User.findOne({email: email});
        if(!user) {
            const error = new Error('A user with this Email could not be found');
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password_hash);
        

        if(!isEqual) {
            const error = new Error('Wrong Password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                user: loadedUser
            }, 
            'somesupersecretsecret', 
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
        });

    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);

    }
};
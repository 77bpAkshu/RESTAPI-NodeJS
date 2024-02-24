const { validationResult } = require('express-validator');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const multer = require('multer');
const fs = require('fs'); // Node.js file system module

// Set up multer to handle form data (for file upload)
const upload = multer();

exports.postCreateAccount = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed! Please check your input data.');
            error.statusCode = 422;
            throw error;
        }

        // Check if a base64-encoded image was provided in the request body
        if (!req.body.encodedImage) {
            const error = new Error('No Image Provided.');
            error.statusCode = 422;
            throw error;
        }

        // Hash the password
        const password = req.body.password;
        const password_hash = await bcrypt.hash(password, 12); // Hash the password

        const { name, username, email, mobile, address } = req.body;
        const encodedImage = req.body.encodedImage;

        // Decode the base64-encoded image
        const base64Image = encodedImage.split(';base64,').pop();
        const imageFileName = `user_${new Date().getTime()}.png`; // Generate a unique filename
        const imagePath = `images/${imageFileName}`;

        // Save the decoded image to the filesystem
        fs.writeFileSync(imagePath, base64Image, { encoding: 'base64' });

        const user = new User({
            user_id: new Date().toISOString(),
            name: name,
            username: username,
            email: email,
            mobile: mobile,
            password_hash: password_hash, // Store the hashed password
            address: address,
            profileUrl: imagePath, // Save the file path as the profile URL
        });

        const result = await user.save();
        res.status(200).json({
            message: "User Registered successfully!",
            user: result,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

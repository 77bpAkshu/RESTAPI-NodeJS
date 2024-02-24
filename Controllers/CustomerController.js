const { validationResult } = require('express-validator');
const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const multer = require('multer');
const fs = require('fs'); // Node.js file system module
const path = require('path');


// Set up multer to handle form data
const upload = multer();
// const bcryptJs = require('bcryptjs');


exports.getCustomers = (req, res, next) => {
    const currentPage = req.params.page || 1;
    const perPage = 2;
    let totalItems;
    User.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return User.find()
                        .skip((currentPage - 1) * perPage)
                        .limit(perPage);
        })
        .then(result => {
            res.status(200).json({
                message: "Users Lists",
                currentPageNum: currentPage,
                user: result,
                totalItems: totalItems,
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);

        });  
};

exports.postCreateAccount2 = (req, res, next) => {
    const errors =validationResult(req);
    if(!errors.isEmpty()) {
        // return res.status(422).json({
        //     message:'Validation Failed!, entered data is incorrect please check again',
        //     error: error.array()
        // });
        const error = new Error('Validation Failed!, Entered data is incorrect please check again...');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file) {
        const error = new Error('No Image Provided.');
        error.statusCode = 422;
        throw error;
    }
    const profileUrl = req.file.path;
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    const address = req.body.address;
    //const profileUrl = req.body.profileUrl;

    const password_hash = password;

    const user = new User({
        user_id: new Date().toISOString,
        name: name,
        username: username,
        email: email,
        mobile: mobile,
        password_hash: password_hash,
        address: address,
        profileUrl: profileUrl
    });

    user.save()
        .then(result => {
            res.status(200).json({
                message: "User Registered succesfully!",
                customer: result
            }); 
        })
        .catch(err => {
            //console.log(err);
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

      
};

exports.postCreateAccount3 = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed! Please check your input data.');
            error.statusCode = 422;
            throw error;
        }

        // Check if a file was uploaded
        if (!req.file) {
            const error = new Error('No Image Provided.');
            error.statusCode = 422;
            throw error;
        }

        // Hash the password
        const password = req.body.password;
        const password_hash = await bcrypt.hash(password, 12); // Hash the password

        const { name, username, email, mobile, address } = req.body;
        const profileUrl = req.file.path; // Assuming you've set up multer for file upload

        const user = new User({
            user_id: new Date().toISOString(),
            name: name,
            username: username,
            email: email,
            mobile: mobile,
            password_hash: password_hash, // Store the hashed password
            address: address,
            profileUrl: profileUrl,
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

exports.getUserDetails = (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const errorMsg = new Error('User Not found');
                errorMsg.statusCode = 404;
                throw errorMsg;
            }
            res.status(200).json({
                message: "User Details : ",
                user: user,
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                errorMsg.statusCode = 500;
            }
            next(err);
        });
};

exports.postUserDetails = (req, res, next) => {
    const errors =validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed!, User Id is required...');
        error.statusCode = 422;
        throw error;
    }
    const userId = req.body._id;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const error = new Error('User Not found');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: "User Details : ",
                user: user
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.putUpdateUser = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed! Please check your input data.');
        error.statusCode = 422;
        throw error;
    }
   const userId = req.params.userId;
   const name = req.body.name;
   const address = req.body.address;
   
   User.findById(userId)
       .then(user => {
            if(!user) {
                const error = new Error('User Not found');
                error.statusCode = 404;
                throw error;
            }
            user.name = name;
            user.address = address;
            const encodedImage = req.body.encodedImage;
            if(encodedImage) {

                // Decode the base64-encoded image
                const base64Image = encodedImage.split(';base64,').pop();
                const imageFileName = `user_${new Date().getTime()}.png`; // Generate a unique filename
                const imagePath = `images/${imageFileName}`;
                if(imagePath !== user.profileUrl) {
                    clearImage(user.profileUrl);
                }


                // Save the decoded image to the filesystem
                fs.writeFileSync(imagePath, base64Image, { encoding: 'base64' });
                user.profileUrl = imagePath;
            }

            return user.save();

       })
       .then(result => {
            res.status(200).json({
                message: "User updated successfully!",
                user: result,
            });
       })
       .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
       });

};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
   
    User.findById(userId)
       .then(user => {
            if(!user) {
                const error = new Error('User Not found');
                error.statusCode = 404;
                throw error;
            }
            clearImage(user.profileUrl);
            return User.findByIdAndRemove(userId);

       })
       .then(result => {
            res.status(200).json({
                message: "User deleted successfully!",
                user: result,
            });
       })
       .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
       });

};




const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        console.log(err);
    });
}

// exports.postUpdateUser = (req, res, next) => {
//     const errors =validationResult(req);
//     if(!errors.isEmpty()) {
//         const error = new Error('Validation Failed!, User Id is required...');
//         error.statusCode = 422;
//         throw error;
//     }
//     const userId = req.body._id;
//     User.findById(userId)
//         .then(user => {
//             if(!user) {
//                 const error = new Error('User Not found');
//                 error.statusCode = 404;
//                 throw error;
//             }
//             res.status(200).json({
//                 message: "User Details : ",
//                 user: user
//             });
//         })
//         .catch(err => {
//             if(!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// };





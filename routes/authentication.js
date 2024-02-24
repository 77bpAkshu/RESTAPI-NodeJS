const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const UserData = require('../Models/UserModel');
const authController = require('../Controllers/AuthController');


router.post('/user-login', authController.postLogin);
router.post('/user-signup', [
    body('name')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Name should be at least 5 characters long'),

    body('username')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Username should be at least 5 characters long')
        .custom((value, { req }) => {
            return UserData.findOne({ username: value})
                       .then(userData => {
                            if(userData) {
                                return Promise.reject('Username already exists!');
                            }
                       });
        }),

    body('mobile')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Mobile number should be at least 10 characters long')
        .custom((value, { req }) => {
            return UserData.findOne({ mobile: value})
                       .then(userData => {
                            if(userData) {
                                return Promise.reject('Mobile Number already exists!');
                            }
                       });
        }),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address')
        .custom((value, { req }) => {
            return UserData.findOne({email: value})
                       .then(userData => {
                            if(userData) {
                                return Promise.reject('E-Mail already exists!');
                            }
                       });
        })
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({min: 8})
        .notEmpty()
        .withMessage('Password cannot be empty'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address cannot be empty'),
], authController.postRegister);

module.exports = router;

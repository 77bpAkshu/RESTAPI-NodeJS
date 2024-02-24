const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const UserData = require('../Models/UserModel');
const customerController = require('../controllers/CustomerController');
const isAuth = require('../Middleware/is-auth');

router.get('/customer-list/:page', isAuth, customerController.getCustomers);

router.post('/signup', isAuth,  [
    body('name')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Name should be at least 5 characters long'),

    body('username')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Username should be at least 5 characters long'),

    body('mobile')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Mobile number should be at least 10 characters long'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password cannot be empty'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address cannot be empty'),
], customerController.postCreateAccount);

router.get('/userDetails/:userId', isAuth, customerController.getUserDetails);

router.post('/userDetails', isAuth, [
    body('_id')
        .trim()
        .notEmpty()
        .withMessage('_id cannot be empty'),
], customerController.postUserDetails);

router.put('/updateUser/:userId', isAuth, [
    [
        body('name')
            .trim()
            .isLength({ min: 5 })
            .withMessage('Name should be at least 5 characters long'),
    
        body('address')
            .trim()
            .notEmpty()
            .withMessage('Address cannot be empty'),
    ]
], customerController.putUpdateUser);
//router.post('/updateUser', customerController.postUpdateUser);

router.delete('/deleteUser/:userId', isAuth, customerController.deleteUser);



module.exports = router;

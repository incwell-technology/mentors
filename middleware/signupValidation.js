const { body } = require('express-validator/check')
const User = require('../models/user')

exports.validate = (method) => {
    switch (method) {
        case 'createUser':
            return [
                body('email').custom(async (value, { req }) => {
                    let user = await User.findOne({ email: req.body.email })
                    if (user) {
                        throw new Error('Email already exists');
                    }
                    return true;
                }),
                body('email', 'Invalid email').isEmail(),
                body('first_name', 'First name should not be empty').not().isEmpty(),
                body('last_name', 'Last name should not be empty').not().isEmpty(),
                body('password', 'Password name should not be empty').not().isEmpty(),
                body('password').custom((value, { req }) => {
                    if (value !== req.body.confirm_password) {
                        throw new Error('Password confirmation is incorrect');
                    }
                    return true;
                }),
                body('password', 'Invalid Password').matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'),
                // body('password', 'Invalid Password').custom((value, { req }) => {
                //     if (body('password').contains(req.body.first_name) ){
                //         throw new Error('Password should not contains name/email');
                //     }
                //     return true;
                // }),
                body('user_role', 'Invalid user role').isBoolean()
            ]
    }
}
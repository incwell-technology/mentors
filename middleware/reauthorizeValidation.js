const { body } = require('express-validator/check')
const User = require('../models/user')

exports.validate = () => {
    return [
        body('email').custom(async (value, { req }) => {
            let user = await User.findOne({ email: req.body.email })
            if (user) {
                if (typeof user.password !== 'undefined') {
                    throw new Error('Email already exists');
                }
            }
            return true;
        }),
        body('email', 'Invalid email').isEmail(),
        body('first_name', 'First name should not be empty').not().isEmpty(),
        body('first_name', 'First name should not be number').not().isNumeric(),
        body('last_name', 'Last name should not be empty').not().isEmpty(),
        body('last_name', 'Last name should not be number').not().isNumeric(),
        body('password', 'Password name should not be empty').not().isEmpty(),
        body('password', 'Invalid Password').matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'),
    ]
}

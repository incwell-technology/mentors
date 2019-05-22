const { body } = require('express-validator/check')

exports.validate = (method) => {
    switch (method) {
        case 'createUser':
            return [
                body('email', 'Email already exists').exists(),
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
                body('password', 'Invalid Password').matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')
            ]
    }
}
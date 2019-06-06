const { body } = require('express-validator/check');

module.exports.validate = () => {
    return [
        body('new_password', 'Password field should not be empty').not().isEmpty(),
        body('new_password', 'New password is not strong enough.').matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'),
        body('new_password').custom((value, { req }) => {
            if (value !== req.body.confirmation_password) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        })
    ]
};
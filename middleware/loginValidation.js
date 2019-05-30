const { body } = require('express-validator/check')

exports.validate = () => {
    return [
        body('email', 'Invalid email').isEmail(),
        body('email', 'Empty Field/s').not().isEmpty(),
        body('password', 'Empty Field/s').not().isEmpty(),
    ]
}
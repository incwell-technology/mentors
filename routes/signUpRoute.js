const router = require('express').Router()
const Register = require('../controller/signUpController')

router.route('/signup',).post(Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendToken',).post(Register.resendToken)
module.exports = router;
const router = require('express').Router()
const Register = require('../controller/signUpController')
const signupValidation = require('../middleware/signupValidation')
const expressValidator = require('express-validator')
const express = require('express')
const app = express()
app.use(expressValidator())

router.route('/signup').post(signupValidation.validate('createUser'), Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendToken').post(Register.resendToken)

module.exports = router;
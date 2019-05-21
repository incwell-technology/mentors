const router = require('express').Router()
const Register = require('../controller/signUpController')
const Login = require('../controller/loginController')
const signupValidation = require('../middleware/signupValidation')
const jwtValidation = require('../middleware/jwtValidation')
const expressValidator = require('express-validator')
const express = require('express')
const app = express()
app.use(expressValidator())

router.route('/signup').post(signupValidation.validate('createUser'), Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendToken').post(Register.resendToken)
router.route('/login').post(Login.login)
router.route('/refreshToken').post(Login.refresh_token)
router.route('/logout').post(jwtValidation.verifyToken, Login.logout)

module.exports = router;
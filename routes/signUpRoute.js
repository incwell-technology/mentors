const router = require('express').Router()
const Register = require('../controller/signUpController')
const Login = require('../controller/loginController')
const signupValidation = require('../middleware/signupValidation')
const jwtValidation = require('../middleware/jwtValidation')
const expressValidator = require('express-validator')
const express = require('express')
const loginValidation = require('../middleware/loginValidation')
const app = express()
app.use(expressValidator())

router.route('/signup').post(signupValidation.validate(), Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendVerification').post(Register.resendVerification)
router.route('/login').post(loginValidation.validate(),Login.login)
router.route('/refreshToken').post(Login.refreshToken)
router.route('/logout').post(jwtValidation.verifyToken, Login.logout)

module.exports = router;
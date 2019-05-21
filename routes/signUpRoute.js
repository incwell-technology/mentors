const router = require('express').Router()
const Register = require('../controller/signUpController')
const Login = require('../controller/loginController')
const validation = require('../controller/middleware')
const expressValidator = require('express-validator')
const express = require('express')
const app = express()
app.use(expressValidator())

router.route('/signup').post(validation.validate('createUser'), Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendToken').post(Register.resendToken)
router.route('/login').post(Login.login)
router.route('/refreshToken').post(Login.refreshToken)
router.route('/logout').post(validation.validate('jwt'), Login.logout)

module.exports = router;
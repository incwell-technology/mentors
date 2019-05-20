const router = require('express').Router()
const Register = require('../controller/signUpController')
const passport = require('passport')
passport.serializeUser(function(user, done) {
    done(null, user);
  });

router.route('/signup',).post(Register.create)
router.route('/confirmation').get(Register.confirmation)
router.route('/resendToken').post(Register.resendToken)

module.exports = router;
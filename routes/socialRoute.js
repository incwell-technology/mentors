const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const signupValidation = require('../middleware/signupValidation')

router.route('/facebook').post(Facebook.facebook)
router.route('/reauthorize').post(signupValidation.validate('createUser'),Facebook.reauthorize)

module.exports = router;    
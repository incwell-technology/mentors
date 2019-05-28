const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const signupValidation = require('../middleware/signupValidation')
const google = require('../controller/googleController')

router.route('/facebook').post(Facebook.facebook)
router.route('/reauthorize').post(signupValidation.validate('createUser'),Facebook.reauthorize)
router.route('/google').post(google.oauthHandler);

module.exports = router;    
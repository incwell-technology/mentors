const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const signupValidation = require('../middleware/signupValidation')
const google = require('../controller/googleController')
const linkedin = require('../controller/linkedInController')

router.route('/facebook').post(Facebook.facebook)
router.route('/reauthorize').post(signupValidation.validate('createUser'),Facebook.reauthorize)
router.route('/google').post(google.oauthHandler);
router.route('/linkedin').post(linkedin.oauthHandler);

module.exports = router;    
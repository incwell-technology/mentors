const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const Github = require('../controller/githubController')
const signupValidation = require('../middleware/signupValidation')
const google = require('../controller/googleController')
const linkedin = require('../controller/linkedInController')

const Reauthorize = require('../controller/reauthorize')

router.route('/facebook').post(Facebook.facebook)
router.route('/github').post(Github.github)
router.route('/reauthorize').post(signupValidation.validate('createUser'), Reauthorize.reauthorize)
router.route('/google').post(google.oauthHandler);
router.route('/linkedin').post(linkedin.oauthHandler);

module.exports = router;    
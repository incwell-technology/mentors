const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const Github = require('../controller/githubController')
const google = require('../controller/googleController')
const linkedin = require('../controller/linkedInController')

const reauthorize = require('../middleware/reauthorizeValidation')
const Reauthorize = require('../controller/reauthorize')

router.route('/facebook').post(Facebook.facebook)
router.route('/github').post(Github.github)
router.route('/google').post(google.oauthHandler);
router.route('/linkedin').post(linkedin.oauthHandler);
router.route('/reauthorize').post(reauthorize.validate(), Reauthorize.reauthorize)

module.exports = router;    
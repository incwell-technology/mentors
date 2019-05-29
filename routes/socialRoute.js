const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const Github = require('../controller/githubController')
const signupValidation = require('../middleware/signupValidation')
const Reauthorize = require('../controller/reauthorize')

router.route('/facebook').post(Facebook.facebook)
router.route('/github').post(Github.github)
router.route('/reauthorize').post(signupValidation.validate('createUser'), Reauthorize.reauthorize)

module.exports = router;    
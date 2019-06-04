const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')
const Github = require('../controller/githubController')
const reauthorize = require('../middleware/reauthorizeValidation')
const Reauthorize = require('../controller/reauthorize')

router.route('/facebook').post(Facebook.facebook)
router.route('/github').post(Github.github)
router.route('/reauthorize').post(reauthorize.validate(), Reauthorize.reauthorize)

module.exports = router;    
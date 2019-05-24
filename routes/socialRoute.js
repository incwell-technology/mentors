const router = require('express').Router()
const Facebook = require('../controller/facebookContoller')

router.route('/auth/facebook').get(Facebook.facebook)
router.route('/auth/facebook/callback').get(Facebook.fbcallback)

module.exports = router;    
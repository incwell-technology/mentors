require('dotenv').config({
    path: 'variables.env'
});
const router = require('express').Router();
const google = require('../controller/googleOauthHandler')


router.route('/google').post(
     google.oauthHandler
);

module.exports = router;

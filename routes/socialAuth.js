require('dotenv').config({
    path: 'variables.env'
});
const router = require('express').Router();
const googleOauthHandler = require('../controller/googleOauthHandler')


router.route('/google').post(async (req, res) => {
    try {
        let googleAccessToken = req.body.accessToken;
        let response = await googleOauthHandler.getMessage(googleAccessToken);
        res.status(response.statusCode).send(response.message);
    } catch(error) {



        res.status(500).send("Internal Server Error");
        console.log("Error calling googleOauthHandler", error);
    }
});

module.exports = router;

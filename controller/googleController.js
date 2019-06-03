require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const googleOAuth = require('../middleware/googleOauthClient');
const socialQuery = require('./socialQueryController');
const tokenGenerator = require('./authTokenGenerator');
const statusMsg = require('../config/statusMsg')



module.exports.oauthHandler = async (req, res) => {
    let googleAuthToken = req.body.accessToken;
    try {
        const response = await googleOAuth.getUserInfo(googleAuthToken);
        const userInfo = response.data;
        userInfo.first_name = userInfo.given_name;
        userInfo.last_name = userInfo.family_name;

        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            access_token,
            refresh_token,
            data: userInfo
        };
        
        try {
            socialQuery.socialQueryController('google_id', userInfo, payload, res);
        } catch (err) {
            err.status = httpStatus.INTERNAL_SERVER_ERROR;
            next(err);
        }
    } catch(error) {
        console.log(error);
        err.status = httpStatus.BAD_REQUEST;
        next(err);
    }
};
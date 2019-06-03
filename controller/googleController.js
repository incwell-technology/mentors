require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const googleOAuth = require('../middleware/googleOauthClient');
const socialQuery = require('./socialQueryController');
const tokenGenerator = require('./authTokenGenerator');


module.exports.oauthHandler = async (req, res, next) => {
    let googleAuthToken = req.body.accessToken;
    try {
        const response = await googleOAuth.getUserInfo(googleAuthToken);
        const userInfo = response.data;
        userInfo.first_name = userInfo.given_name;
        userInfo.last_name = userInfo.family_name;

        const accessToken = await tokenGenerator.access_token(userInfo.email);
        const refreshToken = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            accessToken,
            refreshToken
        };
        
        try {
            socialQuery.socialQueryController('google_id', userInfo, payload, res);
        } catch (error) {
            error.status = httpStatus.INTERNAL_SERVER_ERROR;
            next(error);
        }
    } catch(error) {
        console.log(error);
        error.status = httpStatus.BAD_REQUEST;
        next(error);
    }
}
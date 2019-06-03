require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const linkedinOAuth = require('../middleware/linkedInOauthClient');
const socialQuery = require('./socialQueryController');
const tokenGenerator = require('./authTokenGenerator');


module.exports.oauthHandler = async (req, res, next) => {
    let linkedinAuthToken = req.body.accessToken;
    try {
        const userInfo = await linkedinOAuth.getProfile(linkedinAuthToken);
        userInfo.email =  await linkedinOAuth.getEmail(linkedinAuthToken);

        const accessToken = await tokenGenerator.access_token(userInfo.email);
        const refreshToken = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            accessToken,
            refreshToken,
            data: userInfo
        };


        try {
            socialQuery.socialQueryController('linkedin_id', userInfo, payload, res)
        } catch (error) {
            error.status = httpStatus.INTERNAL_SERVER_ERROR
            next(error)
        }
    } catch (error) {
        console.log(error);
        error.status = httpStatus.BAD_REQUEST;
        next(error);
    }
};
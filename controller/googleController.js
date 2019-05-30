require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const googleOAuth = require('../middleware/googleOauthClient');
const dbQuery = require('../dbQuery/socialMediaQuery');
const tokenGenerator = require('./authTokenGenerator');
const statusMsg = require('../config/statusMsg')



module.exports.oauthHandler = async (req, res) => {
    let googleAuthToken = req.body.accessToken;
    try {
        const response = await googleOAuth.getUserInfo(googleAuthToken);
        const userInfo = response.data;

        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            access_token,
            refresh_token,
            data: userInfo
        };

        try {
            //If the google id already exists in the db, update refresh token in the db
            if (await dbQuery.isExistingUser("google_id", userInfo.id, refresh_token)) {
                return res.status(httpStatus.OK).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
            //if the google email exists in the db, link the accounts
            } else if (await dbQuery.doesUserExistWithEmail(userInfo.email)) {
                await dbQuery.addSocialMediaId("google_id", userInfo, refresh_token);
                return res.status(httpStatus.OK).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
            //otherwise, create a new account
            } else {
                await dbQuery.createAccount("google_id", userInfo, refresh_token);
                return res.status(httpStatus.CREATED).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
            }
        } catch(error) {
            console.log(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                "success": statusMsg.fail.msg,
                "payload": {},
                "error": {
                    "code": httpStatus.INTERNAL_SERVER_ERROR,
                    "message": statusMsg.database_error.msg
                }
            });
        }
    } catch(error) {
        console.log(error);
        return res.status(httpStatus.BAD_REQUEST).json({
            "success": statusMsg.fail.msg,
            "payload": {},
            "error": {
                "code": httpStatus.BAD_REQUEST,
                "message": statusMsg.token_exp.msg
            }
        });
    }
};
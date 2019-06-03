require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const linkedinOAuth = require('../middleware/linkedInOauthClient');
const socialQuery = require('./socialQueryController');
const tokenGenerator = require('./authTokenGenerator');
const statusMsg = require('../config/statusMsg')


module.exports.oauthHandler = async (req, res) => {
    let linkedinAuthToken = req.body.accessToken;
    try {
        const userInfo = await linkedinOAuth.getProfile(linkedinAuthToken);
        userInfo.email =  await linkedinOAuth.getEmail(linkedinAuthToken);

        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            access_token,
            refresh_token,
            data: userInfo
        };


        try {
            socialQuery.socialQueryController('linkedin_id', userInfo, payload, res)
        } catch (err) {
            err.status = httpStatus.INTERNAL_SERVER_ERROR
            next(err)
        }
        // try {
        //     //If the linkedin id already exists in the db, update refresh token in the db
        //     if (await socialAuth.dbQuery.isExistingUser("linkedin_id", userInfo.id, refresh_token)) {
        //         return res.status(httpStatus.OK).json({
        //             "success": statusMsg.success.msg,
        //             "payload": payload
        //         });
        //     //if the linkedin account doesn't have email, send error message 
        //     } else if (!userInfo.email) {
        //         return res.status(http.CONFLICT).json({
        //             "success": statusMsg.fail.msg,
        //             "payload": userInfo
        //         })
        //     //if the linkedin email exists in the db, add linkedin id
        //     } else if (await dbQuery.doesUserExistWithEmail(userInfo.email)) {
        //         await dbQuery.addSocialMediaId("linkedin_id", userInfo, refresh_token);
        //         return res.status(httpStatus.OK).json({
        //             "success": statusMsg.success.msg,
        //             "payload": payload
        //         });
        //         //otherwise, create a new account
        //     } else {
        //         await dbQuery.createAccount("linkedin_id", userInfo, refresh_token);
        //         return res.status(httpStatus.CREATED).json({
        //             "success": statusMsg.success.msg,
        //             "payload": payload
        //         });
        //     }
        // } catch (error) {
        //     console.log(error);
        //     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        //         "success": statusMsg.fail.msg,
        //         "payload": {},
        //         "error": {
        //             "code": httpStatus.INTERNAL_SERVER_ERROR,
        //             "message": statusMsg.database_error.msg
        //         }
        //     });
        // }
    } catch (error) {
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
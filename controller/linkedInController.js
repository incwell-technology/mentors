require('dotenv').config({
    path: '../config/.env'
});

const httpStatus = require('http-status-codes');
const linkedinOAuth = require('../middleware/linkedInOauthClient');
const User = require('../models/user');
const tokenGenerator = require('./authTokenGenerator');
const statusMsg = require('../config/statusMsg')


module.exports.oauthHandler = async (req, res) => {
    let linkedinAuthToken = req.body.accessToken;
    try {
        let userInfo = await linkedinOAuth.getProfile(linkedinAuthToken);
        userInfo.email =  await linkedinOAuth.getEmail(linkedinAuthToken);

        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            access_token,
            refresh_token,
            data: userInfo
        };
        try {
            //If the linkedin id already exists in the db, update refresh token in the db
            if (await dbQuery.isExistingUser(userInfo.linkedinId, refresh_token)) {
                return res.status(httpStatus.OK).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
            //if the linkedin account doesn't have email, send error message 
            } else if (!userInfo.email) {
                return res.status(http.CONFLICT).json({
                    "success": statusMsg.fail.msg,
                    "payload": userInfo
                })
            //if the linkedin email exists in the db, add linkedin id
            } else if (await dbQuery.doesUserExistWithEmail(userInfo.email)) {
                await dbQuery.addLinkedinId(userInfo, refresh_token);
                return res.status(httpStatus.OK).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
                //otherwise, create a new account
            } else {
                await dbQuery.createAccount(userInfo, refresh_token);
                return res.status(httpStatus.CREATED).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
            }
        } catch (error) {
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



const dbQuery = {
    isExistingUser: async (id, refresh_token) => {
        let linkedinId = await User.findOne({
            linkedin_id: id
        });
        if (linkedinId) {
            await linkedinId.refresh_token.push(refresh_token);
            await linkedinId.save();
        }
        return linkedinId;
    },
    doesUserExistWithEmail: async (email) => {
        return await User.findOne({
            email
        });
    },
    addLinkedinId: async (userInfo, refresh_token) => {
        let document = await User.findOne({
            email: userInfo.email
        });
        document.linkedin_id = userInfo.linkedinId;
        await document.refresh_token.push(refresh_token);
        await document.save();
    },
    createAccount: async (userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.firstName,
            last_name: userInfo.lastName,
            email: userInfo.email,
            linkedin_id: userInfo.linkedinId,
            verified_email: true,
            refresh_token
        }
        await User.create(user);
    }
};
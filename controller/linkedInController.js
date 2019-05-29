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
        let userInfo = {};
        let emailResponse = JSON.parse(
            await linkedinOAuth.getEmail(linkedinAuthToken)
        );
        userInfo.email = emailResponse.elements[0]["handle~"].emailAddress;
        console.log(userInfo.email);
        let profileResponse = JSON.parse(
            await linkedinOAuth.getProfile(linkedinAuthToken)
        );
        userInfo.firstName = profileResponse.localizedFirstName;
        userInfo.lastName = profileResponse.localizedLastName;
        userInfo.linkedinId = profileResponse.id;
        console.log(userInfo.linkedinId);            
        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        const payload = {
            access_token,
            refresh_token,
            data: userInfo
        };

        try {
            //If the linkedin id already exists in the db, update refresh token in the db
            if (await dbQuery.idExists(userInfo.linkedinId)) {
                return res.status(httpStatus.OK).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                });
                //if the linkedin email exists in the db, link the accounts
            } else if (await dbQuery.emailExists(userInfo.email)) {
                await dbQuery.updateWithId(userInfo, refresh_token);
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
    idExists: async (id, refresh_token) => {
        const linkedinId = await User.findOne({
            linkedin_id: id
        });
        if (linkedinId) {
            await linkedinId.refresh_token.push(refresh_token);
            await linkedinId.save();
        }
        return linkedinId;
    },
    emailExists: async (email) => {
        return await User.findOne({
            email
        });
    },
    updateWithId: async (userInfo, refresh_token) => {
        await User.findOneAndUpdate({
            email: userInfo.email
        }, {
            linkedin_id: userInfo.linkedinId,
            refresh_token
        });
    },
    createAccount: async (userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.given_name,
            last_name: userInfo.family_name,
            email: userInfo.email,
            linkedin_id: userInfo.id,
            verified_email: true,
            refresh_token
        }
        await User.create(user);
    }
};
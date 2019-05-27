require('dotenv').config({
    path: '../config/variables.env'
});

const httpStatus = require('http-status-codes');
const googleOAuth = require('../middleware/googleOAuthClient');
const User = require('../models/user');
const tokenGenerator = require('./authTokenGenerator');



module.exports.getMessage = async (googleToken) => {
    try {
        const response = await googleOAuth.getUserInfo(googleToken);
        const userInfo = response.data;

        const access_token = await tokenGenerator.access_token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        try {
            //If the google id already exists in the db, store nothing to the db
            if (await dbQuery.idExists(userInfo)) {
                return { 
                    message: access_token,
                    statusCode: httpStatus.OK
                };
            //if the google email exists in the db, link the accounts
            } else if (await dbQuery.emailExists(userInfo)) {
                await dbQuery.updateWithId(userInfo, refresh_token);
                return {
                    message: access_token,
                    statusCode: httpStatus.OK
                };
            } else {
                //otherwise, create a new account
                await dbQuery.createAccount(userInfo, refresh_token);
                return {
                    message: access_token,
                    statusCode: httpStatus.CREATED
                };
            }
        } catch(error) {
            console.log(error);
            return {
                message: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
                statusCode: httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    } catch(error) {
        console.log(error);
        return {
            message: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
            statusCode: httpStatus.BAD_REQUEST
        };
    }
};



const dbQuery = {
    idExists: async (userInfo, refresh_token) => {
        const googleId = await User.findOne({ google_id: userInfo.id });
        if (googleId) {
            await googleId.refresh_token.push(refresh_token);
            await googleId.save();
        }
        return googleId;
    },
    emailExists: async (userInfo) => {
        const googleEmail = await User.findOne({ email: userInfo.email });
        return googleEmail;
    },
    updateWithId: async (userInfo, refresh_token) => {
        await User.findOneAndUpdate({email: userInfo.email}, {google_id: userInfo.id, refresh_token});
    },
    createAccount: async (userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.given_name,
            last_name : userInfo.family_name,
            email: userInfo.email,
            google_id: userInfo.id,
            verified_email: true,
            refresh_token
        }
        User.create(user);
    }
};
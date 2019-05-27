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
            } else {
                //if the google email exists in the db but is not linked, link the accounts
                if (await dbQuery.emailExists(userInfo)) {
                    await dbQuery.updateWithId(userInfo);
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
    idExists: async (userInfo) => {
        try {
            const googleId = await User.findOne({ google_id: userInfo.id });
            if (googleId === null) {
               return false;
            } else {
                return true;
            }
        } catch(error) {
            console.log(error);
        }
    },
    emailExists: async (userInfo) => {
        try {
            const googleEmail = await User.findOne({ email: userInfo.email });
            if (googleEmail === null) {
                return false;
            } else {
                return true;
            }
        } catch(error) {
            console.log(error);
        }
    },
    updateWithId: async (userInfo) => {
        try {
            await User.findOneAndUpdate({email: userInfo.email}, {google_id: userInfo.id});
        } catch(error) {
            console.log(error);
        }
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
        try {
            User.create(user);
        } catch(error) {
            console.log(error);
        }
    }
};
require('dotenv').config({
    path: '../config/variables.env'
});

const googleOAuth = require('../middleware/googleOAuthClient');
const User = require('../models/user');
const tokenGenerator = require('./accessTokenGenerator');



module.exports.getMessage = async (googleToken) => {
    try {
        const response = await googleOAuth.getUserInfo(googleToken);
        const userInfo = response.data;

        const token = await tokenGenerator.token(userInfo.email);
        const refresh_token = await tokenGenerator.refresh_token(userInfo.email);

        try {
            //If the google id already exists in the db, store nothing to the db
            if (await dbQuery.idExists(userInfo)) {
                return { 
                    message: token,
                    statusCode: 200
                };
            } else {
                //if the google email exists in the db but is not linked, link the accoints
                if (await dbQuery.emailExists(userInfo)) {
                    await dbQuery.updateWithId(userInfo);
                    return {
                        message: token,
                        statusCode: 200
                    };
                } else {
                    //otherwise, create a new account
                    await dbQuery.createAccount(userInfo, refresh_token);
                    return {
                        message: token,
                        statusCode: 201
                    };
                }
            }
        } catch(error) {
            console.log(error);
            return { message:"Error connecting database", statusCode: 500}
        }
    } catch(error) {
        console.log(error);
        return { message: "BAD_REQUEST", statusCode: 400};
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
        user = {
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
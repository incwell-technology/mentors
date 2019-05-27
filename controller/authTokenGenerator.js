dotenv.config({
    path: './config/.env'
})
const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretKey');

const access_token = async (email) => {
    return await jwt.sign({
        email
    }, secretKey.token.key, {
        expiresIn: process.env.access_token_exp
    });
};

const refresh_token = async (email) => {
    return await jwt.sign({
        email
    }, secretKey.token.key, {
        expiresIn: process.env.refresh_token_exp
    });
};

module.exports = {
    access_token, refresh_token
};
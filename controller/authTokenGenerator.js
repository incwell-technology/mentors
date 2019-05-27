const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretKey');

const access_token = async (email) => {
    return await jwt.sign({
        email
    }, secretKey.token.key, {
        expiresIn: '24h'
    });
};

const refresh_token = async (email) => {
    return await jwt.sign({
        email
    }, secretKey.token.key, {
        expiresIn: `${24*30}h`
    });
};

module.exports = {
    access_token, refresh_token
};
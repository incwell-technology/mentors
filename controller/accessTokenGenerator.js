const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretKey');

const token = async (email) => {
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
        expiresIn: `${24*7}h`
    });
};

module.exports = {
    token, refresh_token
};
const jwt = require('jsonwebtoken')
const secretKey = require('../config/secretKey')
const dotenv = require('dotenv')
dotenv.config({
  path: './config/.env'
})

const access_token = async (payload) => {
    return await jwt.sign({ payload }, secretKey.token.key, { expiresIn: process.env.access_token_exp });
};

const refresh_token = async (payload) => {
    return await jwt.sign({ payload }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp });
};

module.exports = {
  access_token, refresh_token
};
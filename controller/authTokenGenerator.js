const jwt = require('jsonwebtoken')
const secretKey = require('../config/secretKey')
const dotenv = require('dotenv')
dotenv.config({
  path: './config/.env'
})

<<<<<<< HEAD
const access_token = async (payload) => {
    return await jwt.sign({ payload }, secretKey.token.key, { expiresIn: process.env.access_token_exp });
};

const refresh_token = async (payload) => {
    return await jwt.sign({ payload }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp });
=======
const access_token = async (email) => {
  return await jwt.sign({ email }, secretKey.token.key, { expiresIn: process.env.access_token_exp });
};

const refresh_token = async (email) => {
  return await jwt.sign({ email }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp });
>>>>>>> origin/feature/github_signup
};

module.exports = {
  access_token, refresh_token
};
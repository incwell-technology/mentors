const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const http = require('http-status-codes')
const secretKey = require('../config/secretKey')
const statusMsg = require('../config/statusMsg')
const dotenv = require('dotenv')
dotenv.config({
    path: './config/.env'
})
const tokenGenerator = require('./authTokenGenerator')

exports.login = async (req, res, next) => {
    try {
        if (req.body.email === '' || req.body.password === '') {
            let err = new Error()
            err.status = http.CONFLICT
            next(err)
        }
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            let err = new Error()
            err.status = http.BAD_REQUEST
            return next(err)
        }
        let result = await bcrypt.compare(req.body.password, user.password)
        if (!result) {
            return res.status(http.BAD_REQUEST).json({
                "success": statusMsg.fail.msg,
                "payload": { email: req.body.email },
                "error": {
                    "code": http.BAD_REQUEST,
                    "message": statusMsg.password_not_match.msg
                }
            })
        }
        if (user.verified_email && user.password) {
            const access_token = await tokenGenerator.access_token(req.body.email)
            const refresh_token = await tokenGenerator.refresh_token(req.body.email)
            const response = {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "data": user
            }
            await user.refresh_token.push(refresh_token)
            await user.save()
            res.status(http.OK).json({
                "success": statusMsg.success.msg,
                "payload": response
            })
        }
        else if(!user.passsword){
            let err = new Error()
            err.status = http.FORBIDDEN
            next(err)
        }
        else {
            let err = new Error()
            err.status = http.CONFLICT
            return next(err)
        }
    }
    catch (err) {
        err.status = http.FORBIDDEN
        next(err)
    }
}

exports.refreshToken = async (req, res, next) => {
    try {
        let user = await User.findOne({ refresh_token: req.body.refresh_token })
        if (!user) {
            let err = new Error()
            err.status = http.BAD_REQUEST
            return next(err)
        }
        if (req.body.refresh_token) {
            const access_token = await tokenGenerator.access_token(req.body.email)
            res.status(http.OK).json({
                "success": statusMsg.success.msg,
                "payload": access_token
            })
        }
        else {
            let err = new Error()
            err.status = http.FORBIDDEN
            return next(err)
        }
    }
    catch (err) {
        err.status = http.FORBIDDEN
        next(err)
    }
}

exports.logout = async (req, res, next) => {
    try {
        let user = await User.findOne({ refresh_token: req.body.refresh_token })
        let decoded = await jwt.verify(req.token, secretKey.token.key)
        await user.refresh_token.pull(req.body.refresh_token)
        await user.save()
        res.status(http.OK).json({
            "success": statusMsg.success.msg,
            "payload": ""
        })
    }
    catch (err) {
        err.status = http.FORBIDDEN
        next(err)
    }
}
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

exports.login = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        console.log(user)
        if (!user) {
            let err = new Error()   
            err.status = http.BAD_REQUEST
            return next(err)
        }
        let result = await bcrypt.compare(req.body.password, user.password)
        if (!result) {
            return res.status(http.CONFLICT).json({
                "success": statusMsg.fail.msg,
                "payload": { email: req.body.email },
                "error": {
                    "code": http.CONFLICT,
                    "message": statusMsg.password_not_match.msg
                }
            })
        }
        if (user.verified_email) {
            const access_token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
            const refresh_token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp })
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
        else {
            let err =new Error()
            err.status= http.CONFLICT
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
            const token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
            res.status(http.OK).json({
                "success": statusMsg.success.msg,
                "payload": token
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
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secretKey = require('../config/secretKey')
const dotenv = require('dotenv')
const http = require('http-status-codes')
const email_verify = require('./emailVerify')
const statusMsg = require('../config/statusMsg')
const SALTING = 10
const { validationResult } = require('express-validator/check')
const tokenGenerator = require('./authTokenGenerator')

dotenv.config({
    path: './config/.env'
})

exports.create = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(http.UNPROCESSABLE_ENTITY).json({
            "success": statusMsg.fail.msg,
            "payload": "",
            "error": {
                "code": http.UNPROCESSABLE_ENTITY,
                "message": errors.array()
            }
        })
    }
    try {
        let role = null
        if (req.body.user_role == 1) { role = "Mentor" }
        else { role = "Student" }
        let hash = await bcrypt.hash(req.body.password, SALTING)
        const access_token = await tokenGenerator.access_token(req.body.email)
        const refresh_token = await tokenGenerator.refresh_token(req.body.email)
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            user_role: role,
            password: hash,
            refresh_token: refresh_token
        })
        await user.save()
        host = req.get('host')
        await email_verify.verifyEmail(user.email, user.first_name, host, access_token)
        const response = {
            "accessToken": access_token,
            "data": user,
            "message": statusMsg.email.msg + user.email + '.'
        }
        res.status(http.CREATED).json({
            "success": statusMsg.success.msg,
            "payload": response
        })
    }
    catch (err) {
        err.status = http.CONFLICT
        next(err)
    }
}

exports.confirmation = async (req, res, next) => {
    try {
        if (req.query.token) {
            decoded = await jwt.verify(req.query.token, secretKey.token.key)
            const email = decoded.email
            let user = await User.findOne({ email: email })
            if (!user) next(err.status = http.BAD_REQUEST)
            if (user.verified_email) return res.status(http.CONFLICT).json({
                "success": statusMsg.success.msg,
                "message": statusMsg.email_verfied.msg
            })
            user.verified_email = true
            await user.save()
            res.status(http.OK).json({
                "success": statusMsg.success.msg,
                "message": http.getStatusText(http.OK)
            })
        }
    }
    catch (err) {
        err.status = http.UNAUTHORIZED
        next(err)
    }
}

exports.resendVerification = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            let err = new Error()
            err.status = http.FORBIDDEN
            next(err)
        }
        if (user.verified_email) return res.status(http.BAD_REQUEST).json({
            "success": statusMsg.success.msg,
            "message": statusMsg.email_verfied.msg
        })
        const token = await tokenGenerator.access_token(req.body.email)
        host = req.get('host')
        await email_verify.verifyEmail(user.email, user.first_name, host, token)
    }
    catch (err) {
        err.status = http.UNAUTHORIZED
        next(err)
    }
}
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
const createUser = require('../dbQuery/createUser')
dotenv.config({
    path: './config/.env'
})

exports.create = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(http.UNPROCESSABLE_ENTITY).json({
            "success": statusMsg.fail.msg,
            "payload": {},
            "error": {
                "code": http.UNPROCESSABLE_ENTITY,
                "message": errors.array()
            }
        })
    }
    try {
        const hash = await bcrypt.hash(req.body.password, SALTING)
        let email = await User.findOne({ email: req.body.email })
        if (email) {
            if (typeof email.password === 'undefined') {
                email.password = hash
                email.user_role = req.body.user_role
                await email.save()
                const payload = {
                    "data": email
                }
                res.status(http.CREATED).json({
                    "success": statusMsg.success.msg,
                    "payload": payload
                })
            }
        }
        else if (!email) {
            createUser.createUser(req, res)
        }
    }
    catch (err) {
        console.log(err)
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
            if (!user) {
                let err = new Error()
                err.status = http.CONFLICT
                next(err)
            }
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
        if (user.verified_email) return res.status(http.CONFLICT).json({
            "success": statusMsg.success.msg,
            "message": statusMsg.email_verfied.msg
        })
        const token = await tokenGenerator.access_token(req.body.email)
        host = req.get('host')
        await email_verify.verifyEmail(user.email, user.first_name, host, token)
        res.status(http.OK).json({
            "success": statusMsg.success.msg,
            "payload": token
        })
    }
    catch (err) {
        err.status = http.UNAUTHORIZED
        next(err)
    }
}
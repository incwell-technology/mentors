const dotenv = require('dotenv')
const request = require('request')
const User = require('../models/user')
const http = require('http-status-codes')
const statusMsg = require('../config/statusMsg')
const tokenGenerator = require('./authTokenGenerator')
const bcrypt = require('bcrypt')
const email_verify = require('./emailVerify')
const { validationResult } = require('express-validator/check')
const SALTING = 10
dotenv.config({
    path: './config/.env'
})

exports.facebook = async (req, res, next) => {
    try {
        const fb_access_token = req.body.accessToken
        await request(`https://graph.facebook.com/v3.3/me?fields=id,first_name,last_name,email&access_token=${fb_access_token}`,
            async (err, response) => {
                const userInfo = JSON.parse(response.body)
                const access_token = await tokenGenerator.access_token(userInfo.email)
                const refresh_token = await tokenGenerator.refresh_token(userInfo.email)
                const payload = {
                    "accessToken": access_token,
                    "refreshToken": refresh_token,
                    "data": userInfo
                }
                try {
                    if (await dbQuery.idExists(userInfo, refresh_token)) {
                        return res.status(http.OK).json({
                            "success": statusMsg.success.msg,
                            "payload": payload
                        })
                    }
                    else if (await dbQuery.emailExists(userInfo)) {
                        await dbQuery.updateWithId(userInfo, refresh_token)
                        return res.status(http.OK).json({
                            "success": statusMsg.success.msg,
                            "payload": payload
                        })
                    }
                    else if (!userInfo.email) {
                        return res.status(http.CONFLICT).json({
                            "success": statusMsg.fail.msg,
                            "payload": userInfo
                        })
                    }
                    else {
                        await dbQuery.createAccount(userInfo, refresh_token)
                        return res.status(http.CREATED).json({
                            "success": statusMsg.success.msg,
                            "payload": payload
                        })
                    }
                }
                catch (err) {
                    err.status = http.INTERNAL_SERVER_ERROR
                    next(err)
                }
            }
        )
    }
    catch (err) {
        err.status = http.CONFLICT
        next(err)
    }
}

exports.reauthorize = async (req, res, next) => {
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

const dbQuery = {
    idExists: async (userInfo, refresh_token) => {
        const facebookId = await User.findOne({ facebook_id: userInfo.id })
        if (facebookId) {
            await facebookId.refresh_token.push(refresh_token)
            await facebookId.save()
        }
        return facebookId
    },
    emailExists: async (userInfo) => {
        const facebookEmail = await User.findOne({ email: userInfo.email })
        return facebookEmail
    },
    updateWithId: async (userInfo, refresh_token) => {
        await User.findOneAndUpdate({ email: userInfo.email }, { facebook_id: userInfo.id, refresh_token: refresh_token })
    },
    createAccount: async (userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            email: userInfo.email,
            facebook_id: userInfo.id,
            verified_email: true,
            refresh_token: refresh_token
        }
        await User.create(user)
    }
}
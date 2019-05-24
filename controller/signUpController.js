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

dotenv.config({
    path: './config/.env'
})

exports.create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(http.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }
    try {
        let role = null
        if (req.body.user_role == 1) { role = "Mentor" }
        else { role = "Student" }
        let hash = await bcrypt.hash(req.body.password, SALTING)
        const access_token = await jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
        const refresh_token = await jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp })
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
        await email_verify.verifyEmail(user.email, host, access_token)
        const response = {
            "status": statusMsg.success.msg,
            "accessToken": access_token,
            "data": user,
            "message": statusMsg.email.msg + user.email + '.'
        }
        res.status(http.CREATED).json({ response })
    }
    catch (err) {
        res.status(http.CONFLICT).json({ "message": err.message })
        next(err)
    }
}

exports.confirmation = async (req, res) => {
    try {
        if (req.query.token) {
            decoded = await jwt.verify(req.query.token, secretKey.token.key);
            const email = decoded.email;
            let user = await User.findOne({ email: email })
            if (!user) return res.status(http.BAD_REQUEST).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST) });
            if (user.verified_email) return res.status(http.CONFLICT).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.CONFLICT) });
            user.verified_email = true
            await user.save()
            res.status(http.OK).send({ status: statusMsg.success.msg, message: http.getStatusText(http.OK) });
        }
    }
    catch (err) {
        res.status(http.UNAUTHORIZED).json({ message: err.message });
        next(err)
    }

}

exports.resendToken = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(http.FORBIDDEN).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.FORBIDDEN) });
        if (user.verified_email) return res.status(http.BAD_REQUEST).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST) });
        const token = await jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
        host = req.get('host');
        await email_verify.verifyEmail(user.email, host, token)
    }
    catch (err) {
        res.status(http.UNAUTHORIZED).json({ "message": err.message })
        next(err)
    }

}
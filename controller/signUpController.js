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
    let role = null
    if(req.body.user_role === 1) role = "Mentor"
    else role ="student"
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
    try {
        await user.save()
        host = req.get('host')
        await email_verify.verifyEmail(user.email, host, access_token)
    }
    catch (err) {
        console.log(err)
        if (err) { return res.status(http.INTERNAL_SERVER_ERROR).send({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); }
    }
    const response = {
        "status": statusMsg.success.msg,
        "accessToken": access_token,
        "data": user,
        "message": statusMsg.email.msg + user.email + '.'
    }
    res.status(http.CREATED).json({ response })
}

exports.confirmation = async (req, res) => {
    if (req.query.token) {
        try {
            decoded = await jwt.verify(req.query.token, secretKey.token.key);
        }
        catch (e) {
            return res.status(http.UNAUTHORIZED).json({ message: http.getStatusText(http.UNAUTHORIZED) });
        }
        const email = decoded.email;
        let user = await User.findOne({ email: email })
        if (!user) return res.status(http.BAD_REQUEST).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST) });
        if (user.verified_email) return res.status(http.CONFLICT).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.CONFLICT) });
        user.verified_email = true
        try {
            await user.save()
        }
        catch (err) {
            if (err) { return res.status(http.INTERNAL_SERVER_ERROR).send({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); }
        }
        console.log(user)
        res.status(http.OK).send({ status: statusMsg.success.msg, message: http.getStatusText(http.OK) });
    }
}

exports.resendToken = async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(http.NOT_FOUND).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.NOT_FOUND) });
    if (user.verified_email) return res.status(http.BAD_REQUEST).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST) });
    const token = await jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
    host = req.get('host');
    await email_verify.verifyEmail(user.email, host, token)

}
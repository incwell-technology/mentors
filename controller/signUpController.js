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
        return res.status(422).json({ errors: errors.array() });
    }
    await bcrypt.hash(req.body.password, SALTING, async (err, hash) => {
        if (err) {
            return res.status(http.FORBIDDEN).json({
                status: statusMsg.fail.msg,
                message: http.getStatusText(http.FORBIDDEN)
            });
        }
        else {
            const token = jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: '24h' })
            const refreshToken = await jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: '30d' })
            const user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: hash,
                refresh_token : refreshToken
            })
            user.save()
            host = req.get('host')
            email_verify.verifyEmail(user.email, host, token)
            const response = {
                "status": statusMsg.success.msg,
                "accessToken": token,
                "data": user,
                "message": statusMsg.email.msg + user.email + '.'
            }
            res.status(http.CREATED).json({ response })
        }
    })
}


exports.confirmation = (req, res) => {
    if (req.query.token) {
        try {
            decoded = jwt.verify(req.query.token, secretKey.token.key);
        }
        catch (e) {
            return res.status(http.UNAUTHORIZED).json({ message: http.getStatusText(http.UNAUTHORIZED) });
        }
        const email = decoded.email;
        User.findOne({ email: email }, (err, user) => {
            if (!user) return res.status(http.BAD_REQUEST).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST) });
            if (user.verified_email) return res.status(http.CONFLICT).send({ status: statusMsg.fail.msg, msg: http.getStatusText(http.CONFLICT) });
            user.verified_email = true
            user.save(function (err) {
                if (err) { return res.status(http.INTERNAL_SERVER_ERROR).send({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); }
                res.status(http.OK).send({ status: statusMsg.success.msg, message: http.getStatusText(http.OK) });
            })
        })
    }
}

exports.resendToken = (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (!user) return res.status(http.NOT_FOUND).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.NOT_FOUND)});
        if (user.VerifiedEmail) return res.status(http.BAD_REQUEST).json({ status: statusMsg.fail.msg, msg: http.getStatusText(http.BAD_REQUEST)});

        // Create a verification token, save it, and send email
        const token = jwt.sign({ email: req.body.email }, secretKey.token.key, { expiresIn: '24h' })
        if (err) {
            return res.status(http.INTERNAL_SERVER_ERROR).json({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) });
        }
        // Send the email
        host = req.get('host');
        email_verify.verifyEmail(user.email, host, token)
    })
}
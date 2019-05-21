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

exports.login = async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(http.BAD_REQUEST).json({ message: http.getStatusText(http.BAD_REQUEST) })
    let result = await bcrypt.compare(req.body.password, user.password)
    if (!result) {
        return res.status(http.FORBIDDEN).json({ message: http.getStatusText(http.FORBIDDEN) })
    }
    if (user.verified_email) {
        const token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
        const refresh_token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp })
        const response = {
            "status": statusMsg.success.msg,
            "accesstoken": token,
            "refresh_token": refresh_token,
            "data": user
        }
        await User.updateOne({ 'email': req.body.email },
            { $push: { 'refresh_token': refresh_token } })
        res.status(http.OK).json(response);
    }
    else {
        res.status(http.CONFLICT).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.CONFLICT) })
    }
}

exports.refresh_token = async (req, res) => {
    let user = await User.findOne({ refresh_token: req.body.refresh_token })
    if (!user) return res.json({ message: http.getStatusText(http.UNAUTHORIZED) })
    await bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (!result) {
           return res.status(http.CONFLICT).json({ message: http.getStatusText(http.CONFLICT) })
        }
        if (req.body.refresh_token) {
            const token = jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
            res.status(http.OK).json({ status: statusMsg.success.msg, token: token });
        }
        else {
            res.status(http.FORBIDDEN).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.FORBIDDEN) })
        }
    })
}

exports.logout = async (req, res) => {
    let user = await User.findOne({ refresh_token: req.body.refresh_token })
    await jwt.verify(req.token, secretKey.token.key, async (err, authData) => {
        if (err) {
            res.status(http.FORBIDDEN).json(http.getStatusText(http.FORBIDDEN))
        }
        else {
            await User.updateOne({ refresh_token: req.body.refresh_token },
                { $pull: { 'refresh_token': req.body.refresh_token } })
            res.status(http.OK).json({ message: http.getStatusText(http.OK) })
        }
    })
}
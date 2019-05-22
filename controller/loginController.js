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
    if (!user) return res.status(http.BAD_REQUEST).json({ "status": http.BAD_REQUEST, "message": http.getStatusText(http.BAD_REQUEST) })
    let result = await bcrypt.compare(req.body.password, user.password)
    if (!result) {
        return res.status(http.CONFLICT).json({ "status": http.CONFLICT, "message": http.getStatusText(http.CONFLICT) })
    }
    if (user.verified_email) {
        const access_token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
        const refresh_token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.refresh_token_exp })
        const response = {
            "status": statusMsg.success.msg,
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "data": user
        }
        try {
            await user.refresh_token.push(refresh_token)
            await user.save()
        }
        catch (err) {
            res.status(http.NOT_MODIFIED).json(http.getStatusText(http.NOT_MODIFIED))
        }
        res.status(http.OK).json(response);
    }
    else {
        res.status(http.CONFLICT).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.CONFLICT) })
    }
}

exports.refreshToken = async (req, res) => {
    let user = await User.findOne({ refresh_token: req.body.refresh_token })
    if (!user) return res.json({ message: http.getStatusText(http.UNAUTHORIZED) })
    let result = await bcrypt.compare(req.body.password, user.password)
    if (!result) {
        return res.status(http.CONFLICT).json({ message: http.getStatusText(http.CONFLICT) })
    }
    if (req.body.refresh_token) {
        const token = await jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: process.env.access_token_exp })
        res.status(http.OK).json({ status: statusMsg.success.msg, token: token });
    }
    else {
        res.status(http.FORBIDDEN).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.FORBIDDEN) })
    }
}

exports.logout = async (req, res) => {
    let user = await User.findOne({ refresh_token: req.body.refresh_token })
    try {
        let decoded = await jwt.verify(req.token, secretKey.token.key)
        await user.refresh_token.pull(req.body.refresh_token)
        await user.save()
        res.status(http.OK).json({ message: http.getStatusText(http.OK) })
    }
    catch (err) {
        res.status(http.FORBIDDEN).json(http.getStatusText(http.FORBIDDEN))
    }
}
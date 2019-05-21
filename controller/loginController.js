const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const http = require('http-status-codes')
const secretKey = require('../config/secretKey')
const statusMsg = require('../config/statusMsg')
const express = require('express')
const app = express()

exports.login = async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) res.status(http.BAD_REQUEST).json({ message: http.getStatusText(http.BAD_REQUEST) })
    var result = await bcrypt.compare(req.body.password, user.password)
    if (!result) {
        return res.status(http.FORBIDDEN).json({ message: http.getStatusText(http.FORBIDDEN) })
    }
    if (result) {
        if (user.verified_email) {
            const token = jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: '24h' })
            const refreshToken = jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: '30d' })
            const response = {
                "status": statusMsg.success.msg,
                "token": token,
            }
            await User.updateOne({ 'email': req.body.email },
                { $push: { 'refresh_token': refreshToken } })
            res.status(http.OK).json(response);
        }
        else {
            res.status(http.CONFLICT).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.CONFLICT) })
        }
    }
}

exports.refreshToken = async (req, res) => {
    // refresh the token
    let user = await User.findOne({ refreshToken: req.body.refreshToken })
    if (!user) res.json({ message: http.getStatusText(http.UNAUTHORIZED) })
    if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (!result) {
                res.status(http.FORBIDDEN).json({ message: http.getStatusText(http.FORBIDDEN) })
            }
            if (result) {
                // if refresh token exists
                if (req.body.refreshToken) {
                    const token = jwt.sign({ name: req.body.name, email: req.body.email }, secretKey.token.key, { expiresIn: '24h' })
                    res.status(http.OK).json({ status: statusMsg.success.msg, token: token });
                }
                else {
                    res.status(http.FORBIDDEN).json({ status: statusMsg.fail.msg, message: http.getStatusText(http.FORBIDDEN) })
                }
            }
        })
    }
}

exports.logout = async (req, res) => {
    let user = await User.findOne({ refresh_token: req.body.refreshToken })
    jwt.verify(req.token, secretKey.token.key, async (err, authData) => {
        if (err) {
            res.status(http.FORBIDDEN).json(http.getStatusText(http.FORBIDDEN))
        }
        else {
            await User.updateOne({ refresh_token: req.body.refreshToken },
                { $pull: { 'refresh_token': req.body.refreshToken } })
            res.status(http.OK).json({ message: http.getStatusText(http.OK) })

        }
    })
}
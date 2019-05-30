const User = require('../models/user')
const tokenGenerator = require('../controller/authTokenGenerator')
const bcrypt = require('bcrypt')
const email_verify = require('../controller/emailVerify')
const http = require('http-status-codes')
const statusMsg = require('../config/statusMsg')
const SALTING = 10

exports.createUser = async (req, res) => {
    let role = null
    if (req.body.user_role == 1) { role = "Mentor" }
    else if (req.body.user_role == 0) { role = "Student" }
    const hash = await bcrypt.hash(req.body.password, SALTING)
    const access_token = await tokenGenerator.access_token(req.body.email)
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        user_role: role,
        password: hash,
    })
    await user.save()
    host = req.get('host')
    await email_verify.verifyEmail(user.email, user.first_name, host, access_token)
    const response = {
        "data": user,
        "message": statusMsg.email.msg + user.email + '.'
    }
    res.status(http.CREATED).json({
        "success": statusMsg.success.msg,
        "payload": response
    })
}
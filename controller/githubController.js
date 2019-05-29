const request = require('request')
const dotenv = require('dotenv')
const User = require('../models/user')
const http = require('http-status-codes')
const statusMsg = require('../config/statusMsg')
const tokenGenerator = require('./authTokenGenerator')
dotenv.config({
    path: './config/.env'
})

exports.github = async (req, res, next) => {
    try {
        github_access_token = req.body.access_token
        await request(`https://api.github.com/user?access_token=${github_access_token}`, {
            headers: {
                'user-agent': 'Mentors'
            }
        },
            async (err, response) => {
                const userInfo = JSON.parse(response.body)
                const name = userInfo.name.split(' ', 2)
                const data = {
                    id: userInfo.id,
                    first_name: name[0],
                    last_name: name[1],
                    email: userInfo.email,
                }
                const access_token = await tokenGenerator.access_token(userInfo.email)
                const refresh_token = await tokenGenerator.refresh_token(userInfo.email)
                const payload = {
                    "accessToken": access_token,
                    "refreshToken": refresh_token,
                    "data": data
                }
                try {
                    if (await dbQuery.idExists(data, refresh_token)) {
                        return res.status(http.OK).json({
                            "success": statusMsg.success.msg,
                            "payload": payload
                        })
                    }
                    else if (await dbQuery.emailExists(data)) {
                        await dbQuery.updateWithId(data, refresh_token)
                        return res.status(http.OK).json({
                            "success": statusMsg.success.msg,
                            "payload": payload
                        })
                    }
                    else if (!userInfo.email) {
                        return res.status(http.CONFLICT).json({
                            "success": statusMsg.fail.msg,
                            "payload": data,
                            "error": {
                                "code": http.CONFLICT,
                                "message": http.CONFLICT
                            }

                        })
                    }
                    else {
                        await dbQuery.createAccount(data, refresh_token)
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


const dbQuery = {
    idExists: async (data, refresh_token) => {
        const githubId = await User.findOne({ github_id: data.id })
        if (githubId) {
            await githubId.refresh_token.push(refresh_token)
            await githubId.save()
        }
        return githubId
    },
    emailExists: async (data) => {
        const githubEmail = await User.findOne({ email: data.email })
        return githubEmail
    },
    updateWithId: async (data, refresh_token) => {
        let user = await User.findOne({ email: data.email })
        user.github_id = data.id
        await user.refresh_token.push(refresh_token)
        await user.save()
    },
    createAccount: async (data, refresh_token) => {
        let user = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            github_id: data.id,
            verified_email: true,
            refresh_token: refresh_token
        }
        await User.create(user)
    }
}
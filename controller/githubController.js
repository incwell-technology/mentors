const request = require('request')
const http = require('http-status-codes')
const statusMsg = require('../config/statusMsg')
const tokenGenerator = require('./authTokenGenerator')
const socialAuth = require('../dbQuery/socialAuth')

exports.github = (req, res, next) => {
    github_access_token = req.body.access_token
    request(`https://api.github.com/user?access_token=${github_access_token}`, {
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
                if (await socialAuth.dbQuery.isExistingUser({ github_id: userInfo.id })) {
                    await socialAuth.dbQuery.pushRefreshToken(userInfo, refresh_token)
                    return res.status(http.OK).json({
                        "success": statusMsg.success.msg,
                        "payload": payload
                    })
                }
                else if (await socialAuth.dbQuery.doesUserExistWithEmail(userInfo)) {
                    await socialAuth.dbQuery.addSocialId(userInfo, 'github_id')
                    await socialAuth.dbQuery.pushRefreshToken(userInfo, refresh_token)
                    console.log('some')
                    return res.status(http.OK).json({
                        "success": statusMsg.success.msg,
                        "payload": payload
                    })
                }
                else if (!userInfo.email) {
                    return res.status(http.CONFLICT).json({
                        "success": statusMsg.fail.msg,
                        "payload": userInfo,
                        "error": {
                            "code": http.CONFLICT,
                            "message": statusMsg.no_email.msg
                        }
                    })
                }
                else {
                    await socialAuth.dbQuery.createAccount('github_id', data, refresh_token)
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
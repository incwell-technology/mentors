const request = require('request')
const http = require('http-status-codes')
const statusMsg = require('../config/statusMsg')
const tokenGenerator = require('./authTokenGenerator')
const socialAuth = require('../dbQuery/socialAuth')

exports.facebook = (req, res, next) => {
    const fb_access_token = req.body.accessToken
    request(`https://graph.facebook.com/v3.3/me?fields=id,first_name,last_name,email&access_token=${fb_access_token}`,
        async (err, response) => {
            const userInfo = JSON.parse(response.body)
            console.log(userInfo)
            const access_token = await tokenGenerator.access_token(userInfo.email)
            const refresh_token = await tokenGenerator.refresh_token(userInfo.email)
            const payload = {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "data": userInfo
            }
            try {
                if (await socialAuth.dbQuery.isExistingUser({ facebook_id: userInfo.id })) {
                    await socialAuth.dbQuery.pushRefreshToken(userInfo, refresh_token)
                    return res.status(http.OK).json({
                        "success": statusMsg.success.msg,
                        "payload": payload
                    })
                }
                else if (await socialAuth.dbQuery.doesUserExistWithEmail(userInfo)) {
                    await socialAuth.dbQuery.addSocialId(userInfo, 'facebook_id')
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
                    await socialAuth.dbQuery.createAccount('facebook_id', userInfo, refresh_token)
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
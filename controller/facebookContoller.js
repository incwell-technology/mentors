const request = require('request')
const http = require('http-status-codes')
const tokenGenerator = require('./authTokenGenerator')
const socialQuery = require('../controller/socialQueryController')

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
                socialQuery.socialQueryController('facebook_id', userInfo, payload, res)
            }
            catch (err) {
                err.status = http.INTERNAL_SERVER_ERROR
                next(err)
            }
        }
    )
}
const http = require('http-status-codes')
const socialAuth = require('../dbQuery/socialAuth')
const statusMsg = require('../config/statusMsg')

exports.socialQueryController = async (key, userInfo, payload, res) => {
    if (await socialAuth.dbQuery.isExistingUser(key, userInfo)) {
        await socialAuth.dbQuery.pushRefreshToken(userInfo, payload.refreshToken)
        return res.status(http.OK).json({
            "success": statusMsg.success.msg,
            "payload": payload
        })
    }
    else if (await socialAuth.dbQuery.doesUserExistWithEmail(userInfo)) {
        await socialAuth.dbQuery.addSocialId(userInfo, key)
        await socialAuth.dbQuery.updateVerifyEmail(userInfo)
        await socialAuth.dbQuery.pushRefreshToken(userInfo, payload.refreshToken)
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
        await socialAuth.dbQuery.createAccount(key, userInfo, payload.refreshToken)
        return res.status(http.CREATED).json({
            "success": statusMsg.success.msg,
            "payload": payload
        })
    }
}
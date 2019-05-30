const User = require('../models/user')

exports.dbQuery = {
    isExistingUser: async (userInfo) => {
        const id = await User.findOne(userInfo)
        return id
    },
    doesUserExistWithEmail: async (userInfo) => {
        const email = await User.findOne({ email: userInfo.email })
        return email
    },
    addSocialId: async (userInfo, key) => {
        await User.findOneAndUpdate({ email: userInfo.email }, { [key]: userInfo.id })
    },
    pushRefreshToken: async (userInfo, refresh_token) => {
        let user = await User.findOne({ email: userInfo.email })
        user.refresh_token.push(refresh_token)
        await user.save()
    },
    createAccount: async (key, userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            email: userInfo.email,
            [key]: userInfo.id,
            verified_email: true,
            refresh_token: refresh_token
        }
        await User.create(user)
    }
}
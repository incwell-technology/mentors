const User = require('../models/user');

module.exports = {
    isExistingUser: async (socialMedia, id, refresh_token) => {
        let document = await User.findOne({
            [socialMedia]: id
        });
        if (document) {
            await document.refresh_token.push(refresh_token);
            await document.save();
        }
        return document;
    },
    doesUserExistWithEmail: async (email) => {
        return await User.findOne({
            email
        });
    },
    addSocialMediaId: async (socialMedia, userInfo, refresh_token) => {
        let document = await User.findOne({
            email: userInfo.email
        });
        document[socialMedia] = userInfo.id;
        await document.refresh_token.push(refresh_token);
        await document.save();
    },
    createAccount: async (socialMedia, userInfo, refresh_token) => {
        let user = {
            first_name: userInfo.firstName,
            last_name: userInfo.lastName,
            email: userInfo.email,
            [socialMedia]: userInfo.id,
            verified_email: true,
            refresh_token
        }
        await User.create(user);
    }
};
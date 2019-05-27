require('dotenv').config({
    path: '../config/.env'
});

const google = require('googleapis').google;
const oauth2 = google.oauth2('v2');
const OAuth2 = google.auth.OAuth2;

const authClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
);

module.exports.getUserInfo = async function (accessToken) {
    authClient.setCredentials({
        access_token: accessToken
    });
    return await oauth2.userinfo.get({ auth: authClient });
};

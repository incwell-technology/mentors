const dotenv = require('dotenv')

dotenv.config({
    path: './config/.env'
  })
  
const oauth2 = require('simple-oauth2').create({
    client: {
        id: process.env.FACEBOOK_CLIENT_ID,
        secret: process.env.FACEBOOK_CLIENT_SECRET
    },
    auth: {
        authorizeHost: 'https://facebook.com/',
        authorizePath: '/dialog/oauth',

        tokenHost: 'https://graph.facebook.com',
        tokenPath: '/oauth/access_token'
    }
})

exports.facebook = (req, res) => {
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: 'http://localhost:3000/auth/facebook/callback',
        scope: ['email'],
        profileFields: ['id', 'displayName', 'photos', 'email']
    })
    res.redirect(authorizationUri);
}

exports.fbcallback = async (req, res) => {
    const code = req.query.code;
    const options = {
        code,
        redirect_uri: 'http://localhost:3000/auth/facebook/callback'
    }

    try {
        const result = await oauth2.authorizationCode.getToken(options)
        const token = oauth2.accessToken.create(result)
        return res.status(200).json(result);
    } catch (error) {
        console.error('Access Token Error', error.message);
        return res.status(500).json('Authentication failed');
    }
}
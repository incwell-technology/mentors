const request = require('request')
const http = require('http-status-codes')
const tokenGenerator = require('./authTokenGenerator')
const socialQuery = require('../controller/socialQueryController')

exports.github = (req, res, next) => {
  try {
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
        "refreshToken": refresh_token
      }
      try {
        socialQuery.socialQueryController('github_id', data, payload, res)
      }
      catch (err) {
        err.status = http.INTERNAL_SERVER_ERROR
        next(err)
      }
    }
    )
  }
  catch(err){
    err.status = http.BAD_REQUEST
    next(err)
  }
}
const express = require('express')
// const passport = require('passport')
// const LinkedInStrategy = require('passport-linkedin').Strategy;
const app = express()
const signup = require('../mentors/routes/signUpRoute')
const bodyParser = require('body-parser')
const  mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({
  path:'./config/.env'
})

const url = process.env.DEVELOPMENT_DB_URL
mongoose.connect(url,{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true)
app.listen(3000, () =>
  console.log('Hello Mentors'),
);

app.use(bodyParser.json())
app.use('/mentors/', signup)
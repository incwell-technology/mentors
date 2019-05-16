const express = require('express')
const passport = require('passport')
const LinkedInStrategy = require('passport-linkedin').Strategy;
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
app.use(passport.initialize())
app.use(passport.session())
app.use('/mentors/', signup)
// app.use('/mentors/', login)



app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

passport.use(
  new LinkedInStrategy({
    consumerKey: '81v2h99m8u3lpl',
    consumerSecret: '1xOrOAQQp3hJhUGZ',
    callbackURL: "/auth/linkedin/callback",
    profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick( () => {
      console.log(profile);
      return done(null, profile);
    });
  }
));

app.get('/auth/linkedin',
  passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] })
  );

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin'),
  (req, res) =>  {
    res.send("You are redirected successfully.");
  });

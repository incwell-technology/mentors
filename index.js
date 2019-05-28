const express = require('express')
const app = express()
const signup = require('../mentors/routes/signUpRoute')
const social = require('../mentors/routes/socialRoute')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const morgan = require('morgan')
const errorHandler = require('./middleware/errorHandler')

dotenv.config({
  path: './config/.env'
})

const url = process.env.DEVELOPMENT_DB_URL
mongoose.connect(url, { useNewUrlParser: true });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true)
app.listen(3000, () =>
  console.log('Hello Mentors'),
)
app.get('/', (req, res) => {
  res.json({ msg: "HELLO MENTORS" })
})

app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use('/v1/mentors/', signup)
app.use('/v1/auth/',social)
app.use(errorHandler.errorHandler)

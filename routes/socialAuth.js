//Dependencies
require('dotenv').config({
    path: 'variables.env'
});
const express = require('express');
const dbQuery = require('./mongoQuery');
const cors = require('cors');
const bodyParser = require('body-parser');

//Config
const app = express();
app.use(cors());

app.post('/auth/google', (req, res) => {
    let userInfo = oauth.getUserInfo(req.body.accessToken);
    res.status(200).send('Ok');
});

module.exports = app;

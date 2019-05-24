//Dependencies
require('dotenv').config({
    path: 'variables.env'
});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const googleOauthHandler = require('../controller/googleOauthHandler')

//Config
const app = express();
app.use(cors());
app.use(bodyParser.json({ type: 'application/*+json' }));

//Routes
app.post('/google', async (req, res) => {
    try {
        let googleAccessToken = req.body.accessToken;
        let response = await googleOauthHandler.getMessage(googleAccessToken);
        res.status(response.statusCode).send(response.message);
    } catch(error) {
        res.status(500).send("Internal Server Error");
        console.log("Error calling googleOauthHandler", error);
    }
});

module.exports = app;

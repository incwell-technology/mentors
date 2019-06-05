const router = require('express').Router();
const express = require('express');
const account = require('../controller/accountController');
const password = require('../middleware/passwordValidation');
const expressValidator = require('express-validator');

const app = express();
app.use(expressValidator());

router.put('/password', password.validate(), account.changePassword);

module.exports = router;
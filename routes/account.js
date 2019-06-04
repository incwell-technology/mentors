const router = require('express').Router();
const account = require('../controller/accountController');

router.put('/password', account.changePassword);

module.exports = router;
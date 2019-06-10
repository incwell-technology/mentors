const router = require('express').Router();
const account = require('../controller/accountController');

router.post('/setrole', account.setRole);

module.exports = router;
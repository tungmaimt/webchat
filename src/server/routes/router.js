const express = require('express');
const router = express.Router();
const apiUser = require('../api/user');

router.use('/api/user', apiUser);

module.exports = router;
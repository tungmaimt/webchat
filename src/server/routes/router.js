const express = require('express');
const router = express.Router();
const apiUser = require('../api/user');
const message = require('../api/message');
const { updateSocketUserId, socketMap } = require('../socketMapping');
const verifyToken= require('../verifyToken');

router.use((req, res, next) => {
    if (req.headers['x-access-token']) {
        verifyToken.verify(req.headers['x-access-token'], (err, decoded) => {
            if (err) {
                console.log('asdsad');
                console.log(err);
                return res.json({ err });
            }
            return next();
        })
    } else return next();
});

router.use('/api/user', apiUser);
router.use('/api/message', message);

module.exports = router;
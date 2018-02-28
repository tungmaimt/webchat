const express = require('express');
const router = express.Router();
const apiUser = require('../api/user');
// const jwt = require('jsonwebtoken');
// const secret = 'somethingsecret';
const { updateSocketUserId, socketMap } = require('../socketMapping');
const verifyToken= require('../verifyToken');

router.use((req, res, next) => {
    if (req.headers['x-access-token']) {
        // jwt.verify(req.headers['x-access-token'], secret, (err, decoded) => {
        //     if (err) {
        //         console.log(req.headers['x-access-token']);
        //         return res.json({ err: err });
        //     }
        //     return next();
        // });
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

module.exports = router;
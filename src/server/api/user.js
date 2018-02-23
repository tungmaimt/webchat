const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { getUser, addUser } = require('../mongodb');

const secret = 'somethingsecret';
const { queue } = require('../queue');

router.get('/', (req, res) => {
    return  res.json({res: 'notthing'});
    let payload = { 
        username: req.body.username, 
        password: md5(req.body.password) 
    };
    queue.push({
        topic: queue.TOPIC.userAction,
        stream: queue.STREAM,
        type: queue.TYPE.LOGIN,
        data: { payload: payload, socketId: req.body.socketId }
    }, (err) => {
        if (err) return res.json({ err });
        res.json({ res: 'ok' });
    });
});

router.post('/', (req, res) => {
    let payload = {
        username: req.body.username,
        password: md5(req.body.password)
    };
    queue.push({
        topic: queue.TOPIC.userAction,
        stream: queue.STREAM,
        type: queue.TYPE.SIGN_UP,
        data: { payload: payload, socketId: req.body.socketId }
    }, (err) => {
        if (err) return res.json({ err });
        res.json({ res: 'ok' });
    });
});

router.post('/oauth', (req, res) => {
    let payload = { 
        username: req.body.username, 
        password: md5(req.body.password) 
    };
    queue.push({
        topic: queue.TOPIC.userAction,
        stream: queue.STREAM,
        type: queue.TYPE.LOGIN,
        data: { payload: payload, socketId: req.body.socketId }
    }, (err) => {
        if (err) return res.json({ err });
        res.json({ res: 'ok' });
    });
})

module.exports = router;
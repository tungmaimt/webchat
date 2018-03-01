const express = require('express');
const router = express.Router();
const md5 = require('md5');

const { queue } = require('../queue');

router.get('/', (req, res) => {
    let payload = { id: req.headers['_id']};
    queue.push({
        topic: queue.TOPIC.USER_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.GET_USER_INFO,
        data: { payload: payload }
    }, (err) => {
        if (err) {
            console.log(err);
            return res.json({ err });
        }
        res.json({ res: 'ok' });
    });
});

router.post('/', (req, res) => {
    let payload = {
        username: req.body.username,
        password: md5(req.body.password)
    };
    queue.push({
        topic: queue.TOPIC.USER_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.SIGN_UP,
        data: { payload: payload, socketId: req.body.socketId }
    }, (err) => {
        if (err) {
            console.log(err);
            return res.json({ err });
        }
        res.json({ res: 'ok' });
    });
});

router.post('/oauth', (req, res) => {
    let payload = { 
        username: req.body.username, 
        password: md5(req.body.password) 
    };
    queue.push({
        topic: queue.TOPIC.USER_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.LOGIN,
        data: { payload: payload, socketId: req.body.socketId }
    }, (err) => {
        if (err) return res.json({ err });
        res.json({ res: 'ok' });
    });
});

// router.get('/:searchingKey', (req, res) => {
//     res.json({ res: 'ok' });

//     console.log(req.params.searchingKey);
// });

module.exports = router;
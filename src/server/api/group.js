const express = require('express');
const router = express.Router();

const { queue } = require('../queue');

router.get('/room', (req, res) => {
    let payload = {
        groupId: req.query.id,
        id: req.headers['_id']
    }
    queue.push({
        topic: queue.TOPIC.GROUP_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.GET_ROOMS_INFO,
        data: { payload }
    }, (err) => {
        if (err) {
            res.json({ err });
            return console.log(err);
        }
        res.json({ res: 'ok' });
    });
});

router.post('/room', (req, res) => {
    let payload = {
        id: req.headers['_id'],
        groupId: req.body.groupId,
        roomName: req.body.roomName
    }
    queue.push({
        topic: queue.TOPIC.GROUP_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.ADD_NEW_ROOM,
        data: { payload }
    }, (err) => {
        if (err) {
            res.json({ err });
            return console.log(err);
        }
        res.json({ res: 'ok' });
    });
})

router.post('/', (req, res) => {
    let payload = {
        groupName: req.body.groupName,
        groupDescription: req.body.groupDescription,
        id: req.body.id
    }
    queue.push({
        topic: queue.TOPIC.GROUP_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.CREATE_GROUP,
        data: { payload }
    }, (err) => {
        if (err) {
            res.json({ err });
            return console.log(err);
        }
        res.json({ res: 'ok' });
    })
});

router.put('/', (req, res) => {
    let payload = {
        id: req.headers['_id'],
        joinCode: req.query.code
    }
    queue.push({
        topic: queue.TOPIC.GROUP_ACTION,
        stream: queue.STREAM,
        type: queue.TYPE.JOIN_GROUP,
        data: { payload }
    }, (err) => {
        if (err) {
            res.json({ err });
            return console.log(err);
        }
        res.json({ res: 'ok' });
    })
})

module.exports = router;
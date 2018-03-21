const express = require('express');
const router = express.Router();

const { queue } = require('../queue');

router.get('/', (req, res) => {
    let payload = {}
    payload.id = req.headers['_id'];
    payload.room = req.headers['room'];
    if (req.headers['from'] + '' !== -1 + '') payload.from = req.headers['from'];
    if (req.headers['to'] + '' !== -1 + '') payload.to = req.headers['to'];
    queue.push({
        topic: queue.TOPIC.message,
        stream: queue.STREAM,
        type: queue.TYPE.GET_MESSAGE,
        data: {
            payload: payload
        }
    }, (err) => {
        if (err) {
            console.log(err);
            return res.json({ err });
        }
        return res.json({ res: 'ok' });
    })
});

module.exports = router;
const express = require('express');
const router = express.Router();

const { queue } = require('../queue');

router.get('/', (req, res) => {
    let payload = {
        id: req.headers['_id'],
        friend_id: req.headers['friend_id'],
        from: req.headers['from'],
        to: req.headers['to']
    }
    queue.push({
        topic: queue.TOPIC.message,
        stream: queue.STREAM,
        type: queue.TYPE.GET_FRIEND_MESSAGE,
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
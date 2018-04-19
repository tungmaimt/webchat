const http = require('http');
const express = require('express');
const socketclusterServer = require('socketcluster-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');

// load environment
if (!fs.existsSync(path.join(__dirname, '../../.env.local'))){
    dotenv.config({ path: path.join(__dirname, '../../.env') });
} else {
    dotenv.config({ path: path.join(__dirname, '../../.env.local') });
}

const router = require('./routes/router');
const { mapSocketId, unMapSocketId, socketMap } = require('./socketMapping');
const verifyToken = require('./verifyToken');

const app = express();
const server = http.createServer(app);
const scServer = socketclusterServer.attach(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'users_ava')));

app.use('/', router);

let { queue, attachSocket } = require('./queue');

attachSocket((socketId, response, payload) => {
    scServer.clients[socketId].emit(response, payload);
});

scServer.on('connection', (socket) => {
    socket.on('mapping', (data) => {
        mapSocketId(socket.id, data._id);
        socket.emit('mappingDone', 'done to map socketid');
    });

    socket.on('disconnect', function () {
        unMapSocketId(socket.id);
    });

    socket.on('wcMessage', (data) => {
        verifyToken.verify(data.token, (err, decoded) => {
            if (err) return socket.emit('error', { err });
        });
        let payload = {
            id: data.id,
            room: data.room,
            contents: data.message
        }
        queue.push({
            topic: queue.TOPIC.message,
            stream: queue.STREAM,
            type: queue.TYPE.SAVE_MESSAGE,
            data: { payload }
        }, (err) => {
            if (err) console.log(err);
        });
    });

    socket.on('offer', (data) => {
        verifyToken.verify(data.token, (err, decoded) => {
            if (err) return socket.emit('error', { err });
        });
        console.log('offer');
        queue.push({
            topic: queue.TOPIC.message,
            stream: queue.STREAM,
            type: queue.TYPE.OFFER,
            data: { payload: data }
        }, (err) => {
            if (err) console.log(err);
        })
    });

    socket.on('answer', (data) => {
        verifyToken.verify(data.token, (err, decoded) => {
            if (err) return socket.emit('error', { err });
        });
        console.log('answer');
        queue.push({
            topic: queue.TOPIC.message,
            stream: queue.STREAM,
            type: queue.TYPE.ANSWER,
            data: { payload: data }
        }, (err) => {
            if (err) console.log(err);
        })
    });
});


server.listen(8000, () => {
    console.log('server at 8000');
})

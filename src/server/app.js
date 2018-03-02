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
const veryfyToken = require('./verifyToken');

const app = express();
const server = http.createServer(app);
const scServer = socketclusterServer.attach(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
        veryfyToken.verify(data.token, (err, decoded) => {
            if (err) return socket.emit('error', { err });
        });
        let payload = {
            id: data.id,
            friend_id: data.friend_id,
            contents: data.message
        }
        queue.push({
            topic: queue.TOPIC.message,
            stream: queue.STREAM,
            type: queue.TYPE.SAVE_FRIEND_MESSAGE,
            data: { payload }
        }, (err) => {
            if (err) console.log(err);
        })
    })
});


server.listen(8000, () => {
    console.log('server at 8000');
})

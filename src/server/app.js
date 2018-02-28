const http = require('http');
const express = require('express');
const socketclusterServer = require('socketcluster-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const router = require('./routes/router');

const app = express();
const server = http.createServer(app);
const scServer = socketclusterServer.attach(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);
const { mapSocketId, unMapSocketId, socketMap } = require('./socketMapping');

let { attachSocket } = require('./queue');

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
});


server.listen(8000, () => {
    console.log('server at 8000');
})
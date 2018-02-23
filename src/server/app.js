const http = require('http');
const express = require('express');
const socketclusterServer = require('socketcluster-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const router = require('./routes/router');
const server = http.createServer(app);
const scServer = socketclusterServer.attach(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);
const scidMap = [];


scServer.on('connection', (socket) => {

    // scServer.clients['clientId'].emit('test', {mes: clientId});
    scidMap.push({
        userId: '',
        scid: socket.id
    });

    let { attachSocket } = require('./queue');

    attachSocket((socketId, response, payload) => {
        // socket.emit(response, payload);
        console.log(socketId);
        scServer.clients[socketId].emit(response, payload);
    })

    socket.on('test', (data) => {
        console.log(data.mes);
        socket.emit('test', { mes: data.mes });
    });

    // var interval = setInterval(function () {
    //     socket.emit('rand', {
    //         rand: Math.floor(Math.random() * 5)
    //     });
    //     // socket.exchange.publish('room', {data: 'dadadada'}, (err) => {
    //     //     if (err) console.log(err);
    //     // });
    //     scServer.clients[socket.id].emit('test', {mes: socket.id});
    // }, 1000);

    // socket.on('disconnect', function () {
    //     clearInterval(interval);
    // });
    // console.log('connected');
    // console.log(scServer.clients);
});


server.listen(8000, () => {
    console.log('server at 8000');
})
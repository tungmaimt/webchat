import { handleResponse } from './handlerResponse';

const socket = window.socketCluster.connect({ port: 8000 });
window.someSocket = socket;

socket.on('error', function (err) {
    console.log(err);
  });

socket.on('connect', () => {
    console.log('connected');
});

socket.on('rand', (data) => {
    console.log(data.rand);
});

socket.on('response', (data) => {
    if (data.err) console.log(data.err);
    console.log(data);
    handleResponse(data.response, data.result);
});

socket.on('test', (data) => {
    console.log(data.mes);
    console.log(socket.id);
});

const room = socket.subscribe('room');
room.watch((data) => {
    console.log(data);
});

export default socket;
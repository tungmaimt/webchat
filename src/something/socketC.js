import { handleResponse } from './handlerResponse';

const socket = window.socketCluster.connect({ port: 8000 });
window.someSocket = socket;

socket.on('error', function (err) {
    console.log(err);
  });

socket.on('connect', () => {
    console.log('connected');
    socket.emit('mapping', { _id: window.localStorage._id });
});

socket.on('response', (data) => {
    if (data.err) return console.log(data.err);
    handleResponse(data.response, data.result);
});

socket.on('error', (data) => {
    console.log('err', data);
})

export default socket;
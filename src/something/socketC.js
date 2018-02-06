const socket = window.socketCluster.connect({ port: 8000 });

socket.on('connect', () => {
    console.log('connected');
});

socket.on('rand', (data) => {
    console.log(data.rand);
});

export default socket;
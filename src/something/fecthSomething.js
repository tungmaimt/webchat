import socket from './socketC';
let check = 0;

socket.on('mappingDone', (socket) => {
    check = 1;
});

const fetchSomething = (path, option, callback) => {
    if (check === 0) {
        let interval = setInterval(() => {
            if (check === 0) {
            } else {
                clearInterval(interval);
                fetch(path, option).then(res => res.json().then(data => callback(data)).catch(err => {
                    console.log(err);
                })).catch(err => {
                    console.log(err);
                });
            }
        }, 1000);
    } else {
        fetch(path, option).then(res => res.json().then(data => callback(data)).catch(err => {
            console.log(err);
        })).catch(err => {
            console.log(err);
        });
    }
    
};

export default fetchSomething;
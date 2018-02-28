import socket from './socketC';

const localStorage = window.localStorage;

export default {
    getToken: () => {
        return localStorage.wcToken;
    },
    get_Id: () => {
        return localStorage._id;
    },
    save: (token, _id) => {
        localStorage.wcToken = token;
        localStorage._id = _id;
    },
    getSocketId: () => {
        return socket.id;
    }
}
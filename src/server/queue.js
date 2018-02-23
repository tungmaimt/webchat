const rsq = require('rsq');
const queue = new rsq( 'wc', { redisConfig: { host: '192.168.73.167' } } );
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const secret = 'somethingSecret';

const { getUser, addUser } = require('./mongodb');

const TOPIC = {
    userAction: 'userAction',
    message: 'message'
}
const STREAM = 'redis';
const TYPE = {
    LOGIN: 'login',
    SIGN_UP: 'signUp',
    MESSAGE: 'message'
};

queue.newTopic(TOPIC.userAction).newStream('redis');
queue.newTopic(TOPIC.message).newStream('redis');

const registerQueue = (socket) => {
    queue.registHandle(
        [ { topic: TOPIC.userAction, stream: STREAM, type: TYPE.LOGIN } ],
        (message, done) => {
            getUser(message.data.payload, (err, result) => {
                if (err) {
                    socket(message.data.socketId, 'response', { err });
                    return done();
                }
                if (!result) {
                    socket(message.data.socketId, 'response', {
                        response: 'userLogin',
                        result: { success: false, token: 'notthing', _id: 'cant find' }
                    });
                    return done();
                }
                token = jwt.sign({ id: result._id }, secret, { expiresIn: '30d' });
                socket(message.data.socketId, 'response', {
                    response: 'userLogin',
                    result: { success: true, token: token, _id: result._id }
                });
                done();
            });
        }
    );
    
    queue.registHandle(
        [ { topic: TOPIC.userAction, stream: STREAM, type: TYPE.SIGN_UP } ],
        (message, done) => {
            addUser(message.data.payload, (err, result) => {
                if (err) {
                    socket(message.data.socketId, 'response', { 
                        response: 'userSignUp',
                        result: { resule: err, success: false }
                    });
                    return done();
                }
                socket(message.data.socketId, 'response', {
                    response: 'userSignUp',
                    result: { result, success: true }
                });
                done();
            });
        }
    );
};

module.exports.queue = {
    push: (message, callback) => {
        queue.push(message, (err) => {
            if (err) return callback(err);
            callback();
        });
    },
    TOPIC: TOPIC,
    STREAM: STREAM,
    TYPE: TYPE
}

module.exports.attachSocket = (callback) => {
    registerQueue(callback);
}
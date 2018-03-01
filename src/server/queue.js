const rsq = require('rsq');
const queue = new rsq( 'wc', { redisConfig: { host: '192.168.73.167' } } );
// const queue = new rsq('wc', { redisConfig: { host: '192.168.0.107' } });
// const jwt = require('jsonwebtoken');
const md5 = require('md5');
// const secret = 'somethingsecret';

const mongodb = require('./mongodb');
const { updateSocketUserId, socketMap } = require('./socketMapping');
const verifyToken = require('./verifyToken');

const TOPIC = {
    USER_ACTION: 'USER_ACTION',
    message: 'message',
};
const STREAM = 'redis';
const TYPE = {
    LOGIN: 'login',
    SIGN_UP: 'signUp',
    GET_USER_INFO: 'getUserInfo',
    SAVE_FRIEND_MESSAGE: 'saveMessage',
    GET_FRIEND_MESSAGE: 'getMessage',
};

queue.newTopic(TOPIC.USER_ACTION).newStream(STREAM);
queue.newTopic(TOPIC.message).newStream(STREAM);

const registerQueue = (socket) => {
    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.LOGIN } ],
        (message, done) => {
            mongodb.getUser(message.data.payload, (err, result) => {
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
                token = verifyToken.sign({ userId: result._id });
                socket(message.data.socketId, 'response', {
                    response: 'userLogin',
                    result: { success: true, token: token, _id: result._id }
                });
                updateSocketUserId(message.data.socketId, result._id);
                done();
            });
        }
    );
    
    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.SIGN_UP } ],
        (message, done) => {
            mongodb.addUser(message.data.payload, (err, result) => {
                if (err) {
                    socket(message.data.socketId, 'response', { 
                        response: 'userSignUp',
                        result: { result: err, success: false }
                    });
                    return done();
                }
                if (result === 'user allready exists') {
                    console.log('use');
                    socket(message.data.socketId, 'response', {
                        response: 'userSignUp',
                        result: { result, success: false }
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

    queue.registHandle([ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.GET_USER_INFO } ],
    (message, done) => {
        mongodb.getUserInfo(message.data.payload, (err, result) => {
            if (err) {
                console.log(err);
                return done();
            }

            mongodb.getFriendsInfo(result.friends, (err, result2) => {
                if (err) {
                    console.log(err);
                    return done();
                }

                let check = 0;
                let count = 0;

                if (socketMap.length === 0) return done();
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(element.userId) === JSON.stringify(result.id)) {
                        socket(element.socketId, 'response', {
                            response: 'loadUserInfo',
                            result: { result, success: true }   
                        });
                        socket(element.socketId, 'response', {
                            response: 'loadFriendsInfo',
                            result: { result: result2, success: true }
                        })
                        done();
                        check = 1;
                    }
                    count++;
                    if (count === socketMap.length && check === 0) done();
                });
            });
        })
    });

    queue.registHandle(
        [ { topic: TOPIC.message, stream: STREAM, type: TYPE.GET_FRIEND_MESSAGE } ],
        (message, done) => {
            mongodb.getFriendMessages(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                console.log(message);
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload.id)) {
                        socket(element.socketId, 'response', {
                            response: 'loadFriendMessages',
                            result: { success: true, result }
                        })
                    }
                })
                return done();
            })
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.message, stream: STREAM, type: TYPE.SAVE_FRIEND_MESSAGE } ],
        (message, done) => {
            mongodb.saveFriendMessage(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(message.data.payload.id) === JSON.stringify(element.userId) ||
                    JSON.stringify(message.data.payload.friend_id) === JSON.stringify(element.userId)) {
                        socket(element.socketId, 'response', {
                            response: 'directMessage',
                            result: { 
                                success: true,
                                result: {
                                    sender: message.data.payload.id, 
                                    contents: message.data.payload.contents
                                }
                            }
                        });
                    }
                })
                return done();
            })
        }
    )
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
const rsq = require('rsq');

const REDIS_CONNECT_URL = process.env.REDIS_CONNECT_URL;

const queue = new rsq(
    'wc',
    {
        redisConfig: { url: REDIS_CONNECT_URL }
    }
);

// const queue = new rsq('wc', { redisConfig: { host: '192.168.0.107' } });
const md5 = require('md5');

const mongodb = require('./mongodb');
const { updateSocketUserId, socketMap } = require('./socketMapping');
const verifyToken = require('./verifyToken');

const TOPIC = {
    USER_ACTION: 'USER_ACTION',
    GROUP_ACTION: 'GROUP_ACTION',
    message: 'message',
};
const STREAM = 'redis';
const TYPE = {
    LOGIN: 'login',
    SIGN_UP: 'signUp',
    GET_USER_INFO: 'getUserInfo',
    SAVE_MESSAGE: 'saveMessage',
    GET_MESSAGE: 'getMessage',
    SEARCH: 'search',
    GET_TO_VIEW_INFO: 'GET_TO_VIEW_INFO',
    ADD_FRIEND: 'ADD_FRIEND',
    REMOVE_FRIEND: 'REMOVE_FRIEND',
    CREATE_GROUP: 'CREATE_GROUP',
    GET_ROOMS_INFO: 'GET_ROOMS_INFO',
    ADD_NEW_ROOM: 'ADD_NEW_ROOM',
};

queue.newTopic(TOPIC.USER_ACTION).newStream(STREAM);
queue.newTopic(TOPIC.message).newStream(STREAM);
queue.newTopic(TOPIC.GROUP_ACTION).newStream(STREAM);

const registerQueue = (socket) => {
    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.LOGIN } ],
        (message, done) => {
            mongodb.getUser(message.data.payload, (err, result) => {
                if (err) {
                    socket(message.data.socketId, 'response', { err });
                } else if (!result) {
                    socket(message.data.socketId, 'response', {
                        response: 'userLogin',
                        result: { success: false, token: 'notthing', _id: 'cant find' }
                    });
                } else {
                    token = verifyToken.sign({ userId: result._id });
                    socket(message.data.socketId, 'response', {
                        response: 'userLogin',
                        result: { success: true, token: token, _id: result._id }
                    });
                    updateSocketUserId(message.data.socketId, result._id);
                }
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
                } else if (result === 'user allready exists') {
                    socket(message.data.socketId, 'response', {
                        response: 'userSignUp',
                        result: { result, success: false }
                    });
                } else socket(message.data.socketId, 'response', {
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

                mongodb.getGroupByUser(message.data.payload, (err, result3) => {
                    if (err) {
                        console.log(err);
                        return done();
                    }

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
                            });
                            socket(element.socketId, 'response', {
                                response: 'loadGroupsInfo',
                                result: { result: result3, success: true }
                            })
                        }
                    });
                    done();
                })
            });
        })
    });

    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.SEARCH } ],
        (message, done) => {
            mongodb.searchUser(message.data.payload.key, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(message.data.payload.id) === JSON.stringify(element.userId)) {
                        socket(element.socketId, 'response', {
                            response: 'search',
                            result: {
                                success: true,
                                result: result
                            }
                        });
                    }
                })
                done();
            });
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.GET_TO_VIEW_INFO } ],
        (message, done) => {
            mongodb.getUserInfo(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }

                socketMap.forEach((element, index) => {
                    if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload._id)) {
                        socket(element.socketId, 'response', {
                            response: 'getToView',
                            result: { success: true, result }
                        })
                    }
                })

                done();
            })
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.ADD_FRIEND } ],
        (message, done) => {
            mongodb.addFriend(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                console.log(result[0].friends);

                result.forEach((element, index) => {
                    mongodb.getUserInfo(element.id, (err, result) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
            
                        mongodb.getFriendsInfo(result.friends, (err, result2) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
            
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
                                }
                            });
                        });
                    })
                })

                done();
            })
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.USER_ACTION, stream: STREAM, type: TYPE.REMOVE_FRIEND } ],
        (message, done) => {
            mongodb.removeFriend(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }

                result.forEach((element, index) => {
                    mongodb.getFriendsInfo(element.friends, (err, result) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        socketMap.forEach((element2, index) => {
                            if (JSON.stringify(element2.userId) === JSON.stringify(element.id)) {
                                socket(element2.socketId, 'response', {
                                    response: 'loadUserInfo',
                                    result: { success: true, result: element }
                                });
                                socket(element2.socketId, 'response', {
                                    response: 'loadFriendsInfo',
                                    result: { success: true, result }
                                })
                            }
                        })
                    })
                })

                done();
            })
        }
    );

    //Handle Group Action

    queue.registHandle(
        [ { topic: TOPIC.GROUP_ACTION, stream: STREAM, type: TYPE.CREATE_GROUP } ],
        (message, done) => {
            mongodb.createGroup(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }

                mongodb.getGroupByUser(message.data.payload, (err, result2) => {
                    if (err) {
                        console.log(err);
                        return done();
                    }

                    socketMap.forEach((element, index) => {
                        if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload.id)) {
                            socket(element.socketId, 'response', {
                                response: 'loadGroupsInfo',
                                result: {
                                    success: true,
                                    result: result2
                                }
                            })
                        }
                    });
                    done();
                })
                
            });
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.GROUP_ACTION, stream: STREAM, type: TYPE.GET_ROOMS_INFO } ],
        (message, done) => {
            mongodb.getRoomsByGroup(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload.id)) {
                        socket(element.socketId, 'response', {
                            response: 'loadRoomsInfo',
                            result: { success: true, result }
                        });
                    }
                })
                done();
            })
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.GROUP_ACTION, stream: STREAM, type: TYPE.ADD_NEW_ROOM } ],
        (message, done) => {
            mongodb.addRoom(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                mongodb.getRoomsByGroup(message.data.payload, (err, result2) => {
                    if (err) {
                        console.log(err);
                        return done();
                    }
                    socketMap.forEach((element, index) => {
                        if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload.id)) {
                            socket(element.socketId, 'response', {
                                response: 'loadRoomsInfo',
                                result: { success: true, result: result2 }
                            });
                        }
                    })
                    done();
                });
            })
        }
    )

    //Handle Message Action

    queue.registHandle(
        [ { topic: TOPIC.message, stream: STREAM, type: TYPE.GET_MESSAGE } ],
        (message, done) => {
            mongodb.getMessages(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                
                socketMap.forEach((element, index) => {
                    if (JSON.stringify(element.userId) === JSON.stringify(message.data.payload.id)) {
                        socket(element.socketId, 'response', {
                            response: 'loadFriendMessages',
                            result: { success: true, result }
                        })
                    }
                })
                done();
            })
        }
    );

    queue.registHandle(
        [ { topic: TOPIC.message, stream: STREAM, type: TYPE.SAVE_MESSAGE } ],
        (message, done) => {
            mongodb.saveMessage(message.data.payload, (err, result) => {
                if (err) {
                    console.log(err);
                    return done();
                }
                mongodb.getRoom({ id: result.room }, (err, result2) => {
                    if (err) console.log({err});
                    else {
                        result2.members.forEach((element, index) => {
                            socketMap.forEach((element2, index2) => {
                                if (element.id + '' === element2.userId + '') {
                                    socket(element2.socketId, 'response', {
                                        response: 'directMessage',
                                        result: {
                                            success: true,
                                            result: {
                                                sender: message.data.payload.id,
                                                contents: message.data.payload.contents,
                                                created_date: Date.now(),
                                                room: result2._id
                                            }
                                        }
                                    })
                                }
                            })
                        })
                    }
                });
                // socketMap.forEach((element, index) => {
                //     if (JSON.stringify(message.data.payload.id) === JSON.stringify(element.userId) ||
                //     JSON.stringify(message.data.payload.friend_id) === JSON.stringify(element.userId)) {
                //         socket(element.socketId, 'response', {
                //             response: 'directMessage',
                //             result: {
                //                 success: true,
                //                 result: {
                //                     sender: message.data.payload.id,
                //                     contents: message.data.payload.contents,
                //                     created_date: Date.now()
                //                 }
                //             }
                //         });
                //     }
                // })
                done();
            })
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

const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://127.0.0.1:27017';
const dbname = 'webchat';

const connectDb = (callback) => {
    mongoClient.connect(url, (err, client) => {
        if (err) console.log(err);

        let db = client.db(dbname);
        callback(client, db);
    })
}

module.exports.addUser = (payload, callback) => {
    let user = {};
    user.username = payload.username;
    user.password = payload.password;

    connectDb((client, db) => {
        db.collection('users').find({ username: user.username }).toArray((err, docs) => {
            if (docs.length >= 1) return callback(null, 'user allready exists');
            else {
                db.collection('users').insertOne(user, (err, result) => {
                    if (err) console.log(err);
                    // console.log(result.ops[0]._id);
        
                    let userInfo = {};
                    userInfo.id = result.ops[0]._id;
                    userInfo.info = {};
                    userInfo.info.name = user.username;
                    userInfo.info.birth = '';
                    userInfo.info.fb = '';
                    userInfo.info.email = '';
                    userInfo.info.phone_num = '';
                    userInfo.info.addr = '';
                    userInfo.info.ava = '../../static/images/default_ava.jpg';
                    userInfo.created_date = Date.now();
                    userInfo.mod = false;
                    userInfo.friends = [];
                    userInfo.blockers = [];
                    userInfo.banned = false;
        
                    db.collection('users_info').insertOne(userInfo, (err, result) => {
                        if (err) {
                            console.log(err);
                            callback(err);
                        }
        
                        // console.log(result.ops);
                        client.close();
                        callback(null, 'success');
                    });
                });
            }
        });
        
    })
}

module.exports.getUser = (payload, callback) => {
    connectDb((client, db) => {
        db.collection('users').find({
            username: payload.username,
            password: payload.password
        }).toArray((err, docs) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            client.close();
            callback(null, docs[0]);
        })
    })
}

module.exports.updateUserInfo = (payload, callback) => {
    let info = {};
    info.name = payload.name || 'wry';
    info.birth = payload.birth || '';
    info.fb = payload.fb || '';
    info.email = payload.email || '';
    info.phone_num = payload.phone_num || '';
    info.addr = payload.addr || '';
    info.ava = payload.ava || '../../static/images/default_ava.jpg';

    connectDb((client, db) => {
        db.collection('users_info').findOneAndUpdate(
            { id: payload.id }, 
            { $set: { info: info } }, 
            (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err);
                }
                client.close();
                callback(null, result.result);
            }
        )
    })
}

module.exports.addFriend = (payload, callback) => {
    let done = false;
    let out = 0;

    connectDb((client, db) => {
        db.collection('users_info').find({ id: payload.id }, { projection: {
            created_date: 0,
            info: 0
        }}).toArray((err, docs) => {
            docs[0].friends.push({ id: payload.friend_id, tag: '' });

            db.collection('users_info').updateOne({ _id: docs[0]._id }, {
                $set: {
                    friends: docs[0].friends
                }
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err);
                }
                if (done) {
                    out++;
                    client.close();
                    callback(null, out);
                } else {
                    done = true;
                    out++;
                }
            });

        });

        db.collection('users_info').find({ id: payload.friend_id }, { projection: {
            created_date: 0,
            info: 0
        }}).toArray((err, docs) => {
            docs[0].friends.push({ id: payload.id, tag: '' });

            db.collection('users_info').updateOne({ _id: docs[0]._id }, {
                $set: {
                    friends: docs[0].friends
                }
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    callback(err);
                }
                if (done) {
                    out++;
                    client.close();
                    callback(null, out);
                } else {
                    done = true;
                    out++;
                }
            });
        });

    })
}

module.exports.getUserInfo = (filter, callback) => {
    connectDb((client, db) => {
        db.collection('users_info').find({}, { projection: {
            _id: 0,
            created_date: 0,
            mod: 0
        }}).toArray((err, docs) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            callback(null, docs[0]);
            client.close();
        });
    });
}

module.exports.removeFriend = (payload, callback) => {
    let done = false;
    let out = 0;

    connectDb((client, db) => {
        db.collection('users_info').find({ $or: [
            { id: payload.id },
            { id: payload.friend_id }
        ]}).toArray((err, docs) => {
            if (docs[0].friends.length === 0 || docs[1].friends.length === 0) {
                client.close();
                callback(null, 'nothing to do')
            }

            console.log(docs);
            docs[0].friends.forEach((element, index) => {
                if (JSON.stringify(element.id) === JSON.stringify(payload.id) || 
                    JSON.stringify(element.id) === JSON.stringify(payload.friend_id)) {

                    docs[0].friends.splice(index, 1);
                    db.collection('users_info').updateOne(
                        { id: docs[0].id }, 
                        { $set: { friends: docs[0].friends } }, 
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                callback(err);
                            }
                            if (done) {
                                out++;
                                client.close();
                                callback(null, out)
                            } else {
                                done = true;
                                out++;
                            }
                        }
                    )
                }
            });

            docs[1].friends.forEach((element, index) => {
                if (JSON.stringify(element.id) === JSON.stringify(payload.id)
                    || JSON.stringify(element.id) === JSON.stringify(payload.friend_id)) {
                    docs[1].friends.splice(index, 1);
                    db.collection('users_info').updateOne(
                        { id: docs[1].id },
                        { $set: { friends: docs[1].friends } },
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                callback(err);
                            }
                            if (done) {
                                out++;
                                client.close();
                                callback(null, out);
                            } else {
                                done = true;
                                out++;
                            }
                        }
                    )
                }
            });

            
        })
    })
}

module.exports.editFriendTag = (payload, callback) => {
    connectDb((client, db) => {
        db.collection('users_info').find({ id: payload.id }).toArray((err, docs) => {
            docs[0].friends.forEach((element, index) => {
                if (JSON.stringify(element.id) === JSON.stringify(payload.friend_id)) {
                    element.tag = payload.tag;
                    db.collection('users_info').updateOne(
                        { id: payload.id }, 
                        { $set: { friends: docs[0].friends } },
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                callback(err);
                            }
                            client.close();
                            callback(null, result.result);
                        }
                    )
                }
            })
        })
    })
}



module.exports.saveFriendMessage = (payload, callback) => {
    let message = {};
    let groupFriend = [payload.id, payload.friend_id];
    groupFriend.sort();
    message.group = groupFriend[0] + groupFriend[1];
    message.contents = payload.contents;
    message.sender = payload.sender;
    message.receivers = [];
    message.receivers.push({ id: payload.receivers.id, seen: false });
    message.created_date = Date.now();

    connectDb((client, db) => {
        db.collection('messages').insertOne(message, (err, result) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            client.close();
            callback(null, result.ops[0]._id);
        })
    })
}

module.exports.getFriendMessages = (payload, callback) => {
    let message = {};
    let groupFriend = [payload.id, payload.friend_id];
    groupFriend.sort();
    message.group = groupFriend[0] + groupFriend[1];
    message.from = payload.from;
    message.to = payload.to;

    connectDb((client, db) => {
        db.collection('messages').find({ 
            group: groupFriend, 
            created_date: { $gl: message.from, $lt: message.to } 
        }).toArray((err, docs) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            client.close();
            callback(null, docs);
        })
    })
}

module.exports.updateReceivedMessage = (payload, callback) => {
    connectDb((client, db) => {
        db.collection('messages').find({ _id: payload.id }).toArray((err, docs) => {
            docs[0].receivers.forEach((element) => {
                if (JSON.stringify(element.id) === JSON.stringify(payload.receiver)) {
                    element.received = true;
                    db.collection('messages').findOneAndUpdate(
                        { _id: payload.id }, 
                        { $set: { receivers: element } },
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                callback(err);
                            }
                            client.close();
                            callback(null, result.result);
                        }
                    )
                }
            })
        })
    })
}

module.exports.createGroup = (payload, callback) => {
    let group = {};
    group.name = payload.name;
    group.description = payload.description;
    group.members = [];
    group.admin = payload.id;
    group.members.push({
        id: payload.id,
        join_date: Date.now()
    })
    group.created_date = Date.now();

    connectDb((client, db) => {
        db.collection('groups').insertOne(group, (err, result) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            client.close();
            callback(null, result.ops[0]._id);
        })
    })
}

module.exports.findGroupByMember = (payload, callback) => {
    connectDb((client, db) => {
        db.collection('groups').find({ members: payload.id }).toArray((err, docs) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            client.close();
            callback(null, docs);
        })
    })
}

module.exports.saveGroupMessage = (payload, callback) => {
    let message = {};
    message.group = payload.group;
    message.contents = payload.contents;
    message.sender = payload.sender;
    message.receivers = [];
    message.created_date = Date.now();

    connectDb((client, db) => {
        db.collection('groups').find({ _id: payload.id }).toArray((err, docs) => {
            if (err) {
                console.log(err);
                return callback(err);
            } else {
                let count = 0;
                docs[0].members.forEach((element) => {
                    message.receivers.push({ id: element.id, received: false });
                    count++;
                    if (count === docs[0].members.length) {
                        db.collection('messages').insertOne(message, (err, result) => {
                            if (err) {
                                console.log(err);
                                callback(err);
                            }
                            client.close();
                            callback(null, result.ops[0]._id);
                        })
                    }
                })
            }
        })
    })
}

module.exports.getGroupMessages = (payload, callback) => {
    connectDb((client, db) => {
        db.collection('messages').find({
            group: payload.group,
            created_date: { $gt: payload.from, $lt: payload.to }
        }).toArray((err, docs) => {
            if (err) {
                console.log(err);
                return callback(err);
            } else {
                client.close();
                callback(null, docs);
            }
        })
    })
}
const mongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const url = 'mongodb://127.0.0.1:27017';
const dbname = 'webchat';

const connectDb = (callback) => {
    mongoClient.connect(url, (err, client) => {
        if (err) console.log(err);

        let db = client.db(dbname);
        callback(client, db);
    })
}

class SomeMongo {
    addUser(payload, callback)  {
        let user = {};
        user.username = payload.username;
        user.password = payload.password;
    
        connectDb((client, db) => {
            db.collection('users').find({ username: user.username }).toArray((err, docs) => {
                if (docs.length >= 1) {
                    client.close();
                    return callback(null, 'user allready exists');
                }
                else {
                    db.collection('users').insertOne(user, (err, result) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }
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
                        userInfo.info.ava = '';
                        userInfo.created_date = Date.now();
                        userInfo.mod = false;
                        userInfo.friends = [];
                        userInfo.blockers = [];
                        userInfo.banned = false;
            
                        db.collection('users_info').insertOne(userInfo, (err, result) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
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
    
    getUser(payload, callback) {
        connectDb((client, db) => {
            db.collection('users').find({
                username: payload.username,
                password: payload.password
            }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                client.close();
                callback(null, docs[0]);
            })
        })
    }
    
    updateUserInfo(payload, callback) {
        let info = {};
        info.name = payload.info.name || 'wry';
        info.birth = payload.info.birth || '';
        info.fb = payload.info.fb || '';
        info.email = payload.info.email || '';
        info.phone_num = payload.info.phone_num || '';
        info.addr = payload.info.addr || '';
        info.ava = payload.info.ava || '';
    
        connectDb((client, db) => {
            db.collection('users_info').findOneAndUpdate(
                { id: new ObjectID(payload.id) }, 
                { $set: { info: info } }, 
                (err, result) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }
                    db.collection('users_info').find({ id: new ObjectID(payload.id) }).toArray((err, docs) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }
                        client.close();
                        callback(null, docs[0]);
                    })
                }
            )
        })
    }
    
    addFriend(payload, callback) {
        let id = new ObjectID(payload.id);
        let friendId = new ObjectID(payload.friendId);
        let members = [id, friendId];
        members.sort();
        let add = (roomId, db, client, callback) => {
            db.collection('users_info').find({ id: id }, { projection: {
                created_date: 0,
                info: 0
            }}).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                docs[0].friends.push({ id: friendId, tag: '', track: -1, room: { id: roomId, track: -1 }});
    
                db.collection('users_info').updateOne({ _id: docs[0]._id }, {
                    $set: {
                        friends: docs[0].friends
                    }
                }, (err, result) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }

                    db.collection('users_info').find({ id: friendId }, { projection: {
                        created_date: 0,
                        info: 0
                    }}).toArray((err, docs) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }
                        docs[0].friends.push({ id: id, tag: '', track: -2, room: {id: roomId, track: -2} });
            
                        db.collection('users_info').updateOne({ _id: docs[0]._id }, {
                            $set: {
                                friends: docs[0].friends
                            }
                        }, (err, result) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }
                            db.collection('users_info').find(
                                { $or: [ { id: id }, { id: friendId } ]  }
                            ).toArray((err, docs) => {
                                client.close();
                                return callback(null, docs)
                            });
                        });
                    });
                });
            });
        }
    
        connectDb((client, db) => {
            db.collection('rooms').find({ 
                members: [ { id: members[0], track: -1 }, { id: members[1], track: -1 } ] 
            }).toArray((err, docs) => {
                // console.log('wwww', docs);
                // client.close();
                // callback('ggg')
                if (docs.length !== 0) {
                    add(docs[0]._id, db, client, callback);
                } else {
                    let room = {
                        name: '',
                        members: [ { id: members[0], track: -1 }, { id: members[1], track: -1 } ],
                        created_date: Date.now()
                    }
                    // console.log(room);
                    db.collection('rooms').insertOne(room, (err, result) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }
        
                        let roomId = result.ops[0]._id;
                        add(roomId, db, client, callback);
                    });
                }
            })
            
        })
    }

    answerFriend(payload, callback) {
        let id = new ObjectID(payload.id);
        let friendId = new ObjectID(payload.friendId);
        let out = [];

        connectDb((client, db) => {
            db.collection('users_info').find({ id: id }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                let fr = docs[0].friends.find((element) => {
                    return element.id + '' === payload.friendId + '';
                });
                fr.track = 0;
                fr.room.track = 0;
                out.push(docs[0]);
                db.collection('users_info').updateOne(
                    { id: id },
                    { $set: { friends: docs[0].friends } },
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }

                        db.collection('users_info').find({ id: friendId }).toArray((err, docs) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }

                            let fr = docs[0].friends.find((element) => {
                                return element.id + '' === payload.id + '';
                            });
                            fr.track = 0;
                            fr.room.track = 0;
                            out.push(docs[0]);
                            db.collection('users_info').updateOne(
                                { id: friendId },
                                { $set: { friends: docs[0].friends } },
                                (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        client.close();
                                        return callback(err);
                                    }

                                    client.close();
                                    callback(null, out);
                                }
                            )
                        })
                    }
                )
            })
        })
    }
    
    getUserInfo(filter, callback) {
        let obj = new ObjectID(filter.id);
        connectDb((client, db) => { 
            db.collection('users_info').find({ id: obj }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                client.close();
                callback(null, docs[0]);
            });
        });
    }

    getFriendsInfo(filters, callback) {
        let friends = [];
        let check = 0;
        let done = () => {
            connectDb((client, db) => {
                db.collection('users_info').find({ $or: friends },
                { projection: { id: 1, 'info.name': 1, 'info.ava': 1 } }).toArray((err, docs) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }
                    client.close();
                    callback(null, docs);
                })
            })
        }

        if (filters.length === 0) {
            return callback(null, []);
        }

        filters.forEach((element, index) => {
            friends.push({ id: new ObjectID(element.id) });
            check++;
            if (check === filters.length) done();
        })
    }
    
    searchUser(filter, callback) {
        connectDb((client, db) => {
            db.collection('users_info').find({
                'info.name': { $regex: '.*' + filter + '.*', $options: 'i' } 
            }, { projection: {
                id: 1,
                'info.name': 1,
                'info.ava': 1
            } }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                client.close();
                callback(null, docs);
            });
        });
    }
    
    removeFriend(payload, callback) {
        let id = new ObjectID(payload.id);
        let friendId = new ObjectID(payload.friendId);
    
        connectDb((client, db) => {
            db.collection('users_info').find({ $or: [
                { id: id },
                { id: friendId }
            ]}).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                if (docs.length >= 2) {
                    if (docs[0].friends.length === 0 || docs[1].friends.length === 0) {
                        client.close();
                        return callback(null, 'nothing to do')
                    }
                }

                docs[0].friends.forEach((element, index) => {
                    if (JSON.stringify(element.id) === JSON.stringify(id) || 
                        JSON.stringify(element.id) === JSON.stringify(friendId)) {
    
                        docs[0].friends.splice(index, 1);
                        db.collection('users_info').updateOne(
                            { id: docs[0].id }, 
                            { $set: { friends: docs[0].friends } }, 
                            (err, result) => {
                                if (err) {
                                    console.log(err);
                                    client.close();
                                    return callback(err);
                                }

                                if (docs.length === 1) {
                                    client.close();
                                    return callback(null, [result, result]);
                                }

                                docs[1].friends.forEach((element, index) => {
                                    if (JSON.stringify(element.id) === JSON.stringify(id)
                                        || JSON.stringify(element.id) === JSON.stringify(friendId)) {
                                        docs[1].friends.splice(index, 1);
                                        db.collection('users_info').updateOne(
                                            { id: docs[1].id },
                                            { $set: { friends: docs[1].friends } },
                                            (err, result) => {
                                                if (err) {
                                                    console.log(err);
                                                    client.close();
                                                    return callback(err);
                                                }
                                                db.collection('users_info').find(
                                                    { $or: [ { id: id }, { id: friendId } ] }
                                                ).toArray((err, docs) => {
                                                    if (err) {
                                                        console.log(err);
                                                        client.close();
                                                        return callback(err);
                                                    }

                                                    client.close();
                                                    return callback(null, docs)
                                                })
                                            }
                                        )
                                    }
                                });
                            }
                        )
                    }
                });
            })
        })
    }
    
    editFriendTag(payload, callback) {
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
                                    client.close();
                                    return callback(err);
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
    
    saveMessage(payload, callback) {
        let message = {};
        message.room = payload.room;
        message.sender = payload.id;
        message.contents = payload.contents;
        message.created_date = Date.now();

        connectDb((client, db) => {
            db.collection('messages').insertOne(message, (err, result) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                client.close();
                callback(null, result.ops[0]);
            })
        })
    }

    getMessages(payload, callback) {
        let message = {};
        message.$and = [ { room: payload.room } ];
        if (payload.from && payload.to) message.$and.push({ created_date: { $gt: payload.from, $lt: payload.to } });
        else if (payload.from) message.$and.push({ created_date: { $gt: payload.from } });

        connectDb((client, db) => {
            db.collection('messages').find(message).sort({ created_date: 1 }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    callback(err);
                }
                client.close();
                callback(null, docs.slice(-20));
            })
        })
    }
    
    
    // saveFriendMessage(payload, callback) {
    //     let message = {};
    //     let groupFriend = [payload.id, payload.friend_id];
    //     groupFriend.sort();
    //     message.group = groupFriend[0] + groupFriend[1];
    //     message.contents = payload.contents;
    //     message.sender = payload.id;
    //     message.receivers = [];
    //     message.receivers.push({ id: payload.friend_id, seen: false });
    //     message.created_date = Date.now();
            
    //     connectDb((client, db) => {
    //         db.collection('messages').insertOne(message, (err, result) => {
    //             if (err) {
    //                 console.log(err);
    //                 client.close();
    //                 return callback(err);
    //             }
    //             client.close();
    //             callback(null, result.ops[0]);
    //         })
    //     })
    // }

    getRoom(payload, callback) {
        let filter = {
            _id: new ObjectID(payload.id)
        }
        connectDb((client, db) => {
            db.collection('rooms').find(filter).toArray((err,docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                client.close();
                callback(null, docs[0]);
            })
        })
    }

    getRoomsByGroup(payload, callback) {
        connectDb((client, db) => {
            db.collection('groups').find({ _id: new ObjectID(payload.groupId) }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                let roomsArr = [];
                docs[0].rooms.forEach((element, index) => {
                    roomsArr.push({ _id: new ObjectID(element) });
                    if (roomsArr.length === docs[0].rooms.length) {
                        db.collection('rooms').find({ $or: roomsArr }).toArray((err, docs2) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }

                            client.close();
                            return callback(null, docs2);
                        })
                    }
                })
            })
        })
    }
    
    // getFriendMessages(payload, callback) {
    //     let message = {};
    //     let groupFriend = [payload.id, payload.friend_id];
    //     groupFriend.sort();
    //     message.group = groupFriend[0] + groupFriend[1];
    //     message.from = parseInt(payload.from);
    //     message.to = parseInt(payload.to);
    
    //     connectDb((client, db) => {
    //         db.collection('messages').find({ 
    //             group: message.group,
    //             created_date: {$gt: 1518951332141}
    //         }).toArray((err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 client.close();
    //                 return callback(err);
    //             }
    //             client.close();
    //             callback(null, docs);
    //         })
    //     })
    // }
    
    // updateReceivedMessage(payload, callback) {
    //     connectDb((client, db) => {
    //         db.collection('messages').find({ _id: payload.id }).toArray((err, docs) => {
    //             docs[0].receivers.forEach((element) => {
    //                 if (JSON.stringify(element.id) === JSON.stringify(payload.receiver)) {
    //                     element.received = true;
    //                     db.collection('messages').findOneAndUpdate(
    //                         { _id: payload.id }, 
    //                         { $set: { receivers: element } },
    //                         (err, result) => {
    //                             if (err) {
    //                                 console.log(err);
    //                                 client.close();
    //                                 return callback(err);
    //                             }
    //                             client.close();
    //                             callback(null, result.result);
    //                         }
    //                     )
    //                 }
    //             })
    //         })
    //     })
    // }
    
    createGroup(payload, callback) {
        let group = {};
        group.name = payload.groupName;
        group.join_code = payload.joinCode;
        group.description = payload.groupDescription;
        group.members = [];
        group.admin = payload.id;
        group.members.push({
            id: payload.id,
            join_date: Date.now()
        })
        group.rooms = [];
        group.created_date = Date.now();

        let room = {
            name: 'new room',
            members: [{ id: payload.id, track: 0 }],
            created_date: Date.now()
        }

        connectDb((client, db) => {
            db.collection('rooms').insertOne(room, (err, result) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                group.rooms.push(result.ops[0]._id);

                db.collection('groups').insertOne(group, (err, result) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }
                    client.close();
                    callback(null, result.ops[0]._id);
                })
            })
        });
    }

    disbandGroup(payload, callback) {
        let groupId = new ObjectID(payload.groupId);
        connectDb((client, db) => {
            db.collection('groups').find({ _id: groupId }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                let count = 0;
                let roomsDelete = [];
                docs[0].rooms.forEach((element, index) => {
                    roomsDelete.push({ _id: element });
                    db.collection('rooms').find({ _id: element }).toArray((err, docs2) => {
                        db.collection('messages').deleteMany({ room: element }, (err, result) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }

                            count++;
                            if (count === docs[0].rooms.length) {
                                db.collection('rooms').deleteMany({ $or: roomsDelete }, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        client.close();
                                        return callback(err);
                                    }

                                    db.collection('groups').deleteOne({ _id: groupId }, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            client.close();
                                            return callback(err);
                                        }

                                        client.close();
                                        return callback(null, result);
                                    })
                                })
                            }
                        })
                    })
                })
            })
        })
    }

    joinGroup(payload, callback) {
        connectDb((client, db) => {
            db.collection('groups').find({ join_code: payload.joinCode }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                if (docs.length === 0) {
                    client.close();
                    return callback(null, false);
                } else {
                    let count = 0;
                    let check = true;
                    docs[0].members.forEach((element, index) => {
                        if (element.id + '' === payload.id) check = false;
                        count++;
                        if (count === docs[0].members.length) {
                            if (check) {
                                docs[0].members.push({ id: payload.id, join_date: Date.now() });
                                db.collection('groups').updateOne(
                                    { _id: docs[0]._id },
                                    { $set: { members: docs[0].members } },
                                    (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            client.close();
                                            return callback(err);
                                        }
            
                                        client.close();
                                        return callback(null, docs[0]);
                                    }
                                )
                            } else {
                                client.close();
                                return callback(null, -1);
                            }
                        }
                    });

                    
                }

            })
        })
    }

    changeJoiningCode(payload, callback) {
        let groupId = new ObjectID(payload.groupId);

        connectDb((client, db) => {
            db.collection('groups').findOneAndUpdate(
                { _id: groupId },
                { $set: { join_code: payload.joinCode } },
                (err, result) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }
                    client.close();
                    callback(null, result);
                }
            )
        })
    }
    
    getGroupByUser(payload, callback) {
        connectDb((client, db) => {
            db.collection('groups').find({ members: { $elemMatch: { id: payload.id } } }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }
                client.close();
                callback(null, docs);
            })
        })
    }

    addRoom(payload, callback) {
        let room = {
            name: payload.roomName,
            members: [ { id: new ObjectID(payload.id), track: 0 } ],
            created_date: Date.now()
        }
        connectDb((client, db) => {
            db.collection('rooms').insertOne(room , (err, result) => {
                db.collection('groups').find({ _id: new ObjectID(payload.groupId) }).toArray((err, docs) => {
                    if (err) {
                        console.log(err);
                        client.close();
                        return callback(err);
                    }

                    docs[0].rooms.push(result.ops[0]._id);
                    db.collection('groups').updateOne(
                        { _id: docs[0]._id }, 
                        { $set: { rooms: docs[0].rooms } },
                        (err, result2) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }

                            client.close();
                            callback(null, result.ops[0]._id);
                        }
                    )
                })
            })
        })
    }

    joinRoom(payload, callback) {
        connectDb((client, db) => {
            db.collection('rooms').find({ _id: new ObjectID(payload.roomId) }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err);
                }

                docs[0].members.push({ id: new ObjectID(payload.id), track: 0 });
                db.collection('rooms').updateOne(
                    { _id: docs[0]._id },
                    { $set: { members: docs[0].members } },
                    (err, result2) => {
                        if (err) {
                            console.log(err);
                            client.close();
                            return callback(err);
                        }

                        client.close();
                        callback(null, docs[0]);
                    }
                )
            })
        })
    }

    getUsersInfoInGroup(payload, callback) {
        connectDb((client, db) => {
            db.collection('groups').find({ _id: new ObjectID(payload.groupId) }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close();
                    return callback(err)
                }

                let tem = [];
                docs[0].members.forEach((element, index) => {
                    tem.push({ id: new ObjectID(element.id + '') });
                    if (docs[0].members.length === tem.length) {
                        db.collection('users_info').find(
                            { $or: tem }, 
                            { projection: { id: 1, 'info.name': 1 } }
                        ).toArray((err, docs2) => {
                            if (err) {
                                console.log(err);
                                client.close();
                                return callback(err);
                            }

                            client.close();
                            return callback(null, docs2);
                        })
                    }
                })
            })
        })
    }

    getMultiUsersInfo(payload, callback) {
        if (payload.length <= 0) {
            return callback(null, []);
        }
        let filter = payload.map((item, index) => {
            return {
                id: new ObjectID(item.id)
            }
        })
        connectDb((client, db) => {
            db.collection('users_info').find({ $or: filter }).toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    client.close()
                    return callback(err);
                }

                client.close();
                return callback(null, docs);
            })
        })
    }
    
    // saveGroupMessage(payload, callback) {
    //     let message = {};
    //     message.group = payload.group;
    //     message.contents = payload.contents;
    //     message.sender = payload.sender;
    //     message.receivers = [];
    //     message.created_date = Date.now();
    
    //     connectDb((client, db) => {
    //         db.collection('groups').find({ _id: payload.id }).toArray((err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 client.close();
    //                 return callback(err);
    //             } else {
    //                 let count = 0;
    //                 docs[0].members.forEach((element) => {
    //                     message.receivers.push({ id: element.id, received: false });
    //                     count++;
    //                     if (count === docs[0].members.length) {
    //                         db.collection('messages').insertOne(message, (err, result) => {
    //                             if (err) {
    //                                 console.log(err);
    //                                 client.close();
    //                                 return callback(err);
    //                             }
    //                             client.close();
    //                             callback(null, result.ops[0]._id);
    //                         })
    //                     }
    //                 })
    //             }
    //         })
    //     })
    // }
    
    // getGroupMessages(payload, callback) {
    //     connectDb((client, db) => {
    //         db.collection('messages').find({
    //             group: payload.group,
    //             created_date: { $gt: payload.from, $lt: payload.to }
    //         }).toArray((err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 client.close();
    //                 return callback(err);
    //             } else {
    //                 client.close();
    //                 callback(null, docs);
    //             }
    //         })
    //     })
    // }
}

module.exports = new SomeMongo();
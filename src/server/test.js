const mongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'webchat';

const { createUser,
    checkLogin,
    updateUserInfo, 
    findUserInfo, 
    createMessage, 
    addFriend, 
    removeFriend,
    editFriendTag,
    createGroup
} = require('./mongodb');

// id = insertUser({
//     username: 'maitung',
//     password: 'maitung'
// })

const payload = {};

mongoClient.connect(url, (err, client) => {
    let db = client.db(dbName);
    db.collection('users').find({}).toArray((err, docs) => {
        payload.id = docs[2]._id;
        payload.name = 'Mai Thanh Tungf';
        payload.birth = '1999/9/9';
        payload.fb = 'tungmai@fb';
        payload.email = 'tungmai@google';
        payload.phone_num = '123456789';
        payload.addr = 'some addr';
        client.close();

        updateUserInfo(payload, (err, result) => {
        
        })
    })
})


// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         console.log(docs[0]._id + docs[1]._id);
//     })
// })

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         console.log(docs);
//         payload.id = docs[2]._id;
//         payload.friend_id = docs[3]._id;
//         console.log(payload);
//         client.close();
//         let result = addFriend(payload) || 'eeee';
//         console.log(result);
//     })
// })

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         payload.id = docs[3]._id;
//         payload.friend_id = docs[2]._id;
//         client.close();
//         removeFriend(payload);
//     })
// })

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         payload.id = docs[2]._id;
//         payload.friend_id = docs[3]._id;
//         payload.tag = 'new tagggggggggggg';
//         client.close();
//         console.log(editFriendTag(payload));
//     })
// })

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         payload.id = docs[2]._id;
//         payload.name = 'group test';
//         payload.descritption = 'description test';
//         client.close();
//         createGroup(payload);
//     })
// })


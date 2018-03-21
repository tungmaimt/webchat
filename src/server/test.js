const mongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'webchat';

const mongodb = require('./mongodb');

// id = insertUser({
//     username: 'maitung',
//     password: 'maitung'
// })

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         payload.id = docs[2]._id;
//         payload.name = 'Mai Thanh Tungf';
//         payload.birth = '1999/9/9';
//         payload.fb = 'tungmai@fb';
//         payload.email = 'tungmai@google';
//         payload.phone_num = '123456789';
//         payload.addr = 'some addr';
//         client.close();

//         updateUserInfo(payload, (err, result) => {
        
//         })
//     })
// })


// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         console.log(docs[0]._id + docs[1]._id);
//     })
// })


// add friend test
// const payload = {};

// mongoClient.connect('mongodb://localhost:27017', (err, client) => {
//     let db = client.db('webchat');
//     db.collection('users').find({}).toArray((err, docs) => {
//         console.log(docs);
//         payload.id = docs[0]._id;
//         payload.friend_id = docs[1]._id;
//         console.log(payload);
//         client.close();
//         let result = mognodb.addFriend(payload) || 'eeee';
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

// const payload = {};

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         payload.id = docs[2]._id;
//         // payload.id = {};
//         client.close();
//         getUserInfo(payload, (err, result) => {
//             if (err) console.log(err);
//             console.log(result);
//         })
//     })
// })

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('users').find({}).toArray((err, docs) => {
//         client.close();
//     })
// })

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     let query = {info: {name: "caigi"}};
//     db.collection('users_info').find({ 'info.name': 'caigi' }).toArray((err, docs) => {
//         if (err) {
//             console.log(err);
//             return client.close();
//         }
//         console.log(docs[0].friends);
//         client.close();
//         mongodb.getFriendsInfo(docs[0].friends, (err, result) => {
//             if (err) {
//                 console.log(err);
//                 return client.close();
//             }
//             console.log(result);
//             client.close();
//         });
//     })
// })

// mongodb.searchUser('mai', (err, result) => {
//     if (err) return console.log(err);
//     console.log(result);
// })

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     let rg = '^c';
//     db.collection('users_info').find({ 'info.name': { $regex: rg } }).toArray((err, docs) => {
//         if (err) {
//             console.log(err);
//             return client.close();
//         }
//         console.log(docs);
//         client.close();
//     })
// })

// mongodb.addFriend('asd', (err, result) => {
//     if (err) console.log(err);
//     console.log(result);
// })

// mongoClient.connect(url, (err, client) => {
//     let db = client.db(dbName);
//     db.collection('groups').find().toArray((err, docs) => {
//         if (err) {
//             console.log(err);
//             return client.close();
//         }
//         console.log(docs[0].members);
//         db.collection('rooms').find({ _id: docs[0].room[0] }).toArray((err, docs) => {
//             if (err) {
//                 console.log(err);
//                 return client.close();
//             }
//             console.log(docs[0].members);
//             client.close();
//         })
//     })
// })

mongoClient.connect(url, (err, client) => {
    let db = client.db(dbName);
    db.collection('groups').drop((err, result) => {
        if (err) {
            console.log(err);
            client.close();
        }
        console.log(result);
        client.close();
    });
})
const redis = require('redis');

const REDIS_CONNECT_URL = process.env.REDIS_CONNECT_URL;
const client = redis.createClient({ url: REDIS_CONNECT_URL });

const LIST_JOINING_CODE = 'listJoiningCode';

const rNumber = () => {
    return Math.floor(Math.random() * 10);
}

const rWordU = () => {
    return String.fromCharCode(Math.floor(Math.random() * 25 + 65));
}

const rWordL = () => {
    return String.fromCharCode(Math.floor(Math.random() * 25 + 97));
}

const genCode = (callback) => {
    let range = 5;
    let count = 0;
    let code = '';
    let maxTry = 10;
    let gTry = 0;
    let loop = (count, max) => {
        if (count <= max) {
            setTimeout(() => {
                let coreChar = Math.random();
                if (coreChar <= 0.2) {
                    code += rNumber();
                } else if (coreChar <= 0.6) {
                    code += rWordU();
                } else {
                    code += rWordL();
                }
                if (count < max) {
                    loop(count + 1, max);
                } else {
                    client.sismember(LIST_JOINING_CODE, code, (err, reply) => {
                        if (err) {
                            return callback(err);
                        }
                        if (!reply) {
                            client.sadd(LIST_JOINING_CODE, code);
                            callback(null, code);
                        } else {
                            code = '';
                            if (gTry <= maxTry) {
                                gTry++;
                                loop(0, max);
                            } else {
                                gTry = 0;
                                loop(0, max + 1);
                            }
                        }
                    })
                }
            }, 0)
        }
    }
    loop(1, range);
}

const reGenCode = (oldCode, callback) => {
    client.srem(LIST_JOINING_CODE, oldCode, (err, reply) => {
        if (err) return callback(err);
        genCode(callback);
    });
}

module.exports = {
    genCode,
    reGenCode
}
const jwt = require('jsonwebtoken');
const secret = 'somethingsecret';

module.exports = {
    verify: (token, callback) => {
        jwt.verify(token, secret, (err, decoded) => {
            callback(err, decoded)
        });
    },
    sign: (payload) => {
        return jwt.sign(payload, secret, {expiresIn: '30d'});
    }
}
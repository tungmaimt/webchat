let map = [];

const mapSocketId = (socketId, userId) => {
    map.push({
        socketId: socketId,
        userId: userId
    });
}

const unMapSocketId = (socketId) => {
    map.forEach((element, index) => {
        if (element.socketId === socketId) {
            map.splice(index, 1);
        }
    });
}

const updateSocketUserId = (socketId, userId) => {
    map.forEach((element) => {
        if (JSON.stringify(element.socketId) === JSON.stringify(socketId)) {
            console.log('dc');
            element.userId = userId;
        }
    })
}

module.exports.socketMap = map;
module.exports.mapSocketId = mapSocketId;
module.exports.unMapSocketId = unMapSocketId;
module.exports.updateSocketUserId = updateSocketUserId;
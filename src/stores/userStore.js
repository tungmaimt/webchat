import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

const LOAD_USER_INFO = 'UPDATE_USER_INFO';
const LOAD_FRIEND_INFO = 'LOAD_FRIEND_INFO';

let userInfo = {};
let friendsInfo = [];

class UserStore extends EventEmitter {
    constructor() {
        super();

        Dispatcher.register(this.registerToAction.bind(this));
    }

    registerToAction(action) {
        switch (action.actionType) {
            case ActionTypes.LOAD_USER_INFO:
                this.loadUserInfo(action.payload);
            break;
            case ActionTypes.LOAD_FRIEND_INFO:
                this.loadFriendInfo(action.payload);
            break;
            default: 
        }
    }

    loadFriendInfo(payload) {
        friendsInfo = payload;
        this.emit(LOAD_FRIEND_INFO);
    }

    loadUserInfo(payload) {
        userInfo = payload;
        this.emit(LOAD_USER_INFO);
    }

    getUserInfo() {
        return userInfo;
    }

    getFriendInfo() {
        return friendsInfo;
    }

    addLoadFriendInfoListener(callback) {
        this.on(LOAD_FRIEND_INFO, callback);
    }

    removerLoadFriendInfoListener(callback) {
        this.removeListener(LOAD_FRIEND_INFO, callback);
    }

    addLoadUserInfoListener(callback) {
        this.on(LOAD_USER_INFO, callback);
    }

    removerLoadUserInfoListener(callback) {
        this.removeListener(LOAD_USER_INFO, callback);
    }
}

export default new UserStore();
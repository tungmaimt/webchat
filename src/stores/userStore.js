import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

const LOAD_USER_INFO = 'UPDATE_USER_INFO';
const LOAD_FRIEND_INFO = 'LOAD_FRIEND_INFO';
const LOAD_SEARCH_RESULT = 'LOAD_SEARCH_RESULT';
const VIEW_INFO = 'VIEW_INFO';

let userInfo = {};
let friendsInfo = [];
let info = {};
let searchResult = [];
let searchMode = false;

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
            case ActionTypes.LOAD_SEARCH_RESULT:
                this.loadSearchResult(action.payload);
            break;
            case ActionTypes.VIEW_INFO:
                this.viewInfo(action.payload);
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

    loadSearchResult(payload) {
        searchResult = payload.searchResult;
        searchMode = payload.searchMode;
        this.emit(LOAD_SEARCH_RESULT);
    }

    viewInfo(payload) {
        info = payload;
        this.emit(VIEW_INFO);
    }

    getUserInfo() {
        return userInfo;
    }

    getFriendInfo() {
        return friendsInfo;
    }

    getSearchResult() {
        return searchResult;
    }

    getSearchMode() {
        return searchMode;
    }

    getInfo() {
        return info;
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

    addLoadSearchResultListener(callback) {
        this.on(LOAD_SEARCH_RESULT, callback);
    }

    removerLoadSearchResultListener(callback) {
        this.removeListener(LOAD_SEARCH_RESULT, callback);
    }

    addViewInfoListener(callback) {
        this.on(VIEW_INFO, callback);
    }

    removerViewInfoListener(callback) {
        this.removeListener(VIEW_INFO, callback);
    }
}

export default new UserStore();
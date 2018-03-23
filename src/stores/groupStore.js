import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

const LOAD_GROUPS_INFO = 'LOAD_GROUPS_INFO';
const VIEW_GROUP = 'VIEW_GROUP';
const LOAD_ROOMS_INFO = 'LOAD_ROOMS_INFO';
const LOAD_USERS_INFO_IN_GROUP = 'LOAD_USERS_INFO_IN_GROUP';

let groups = [];
let info = {};
let rooms = [];
let usersInfoInGroup = [];

class GroupStore extends EventEmitter {

    constructor() {
        super();

        Dispatcher.register(this.registerToAction.bind(this));
    }

    registerToAction(action) {
        switch (action.actionType) {
            case ActionTypes.VIEW_GROUP:
                this.viewGroup(action.payload);
            break;
            case ActionTypes.LOAD_GROUPS_INFO:
                this.loadGroupsInfo(action.payload);
            break;
            case ActionTypes.LOAD_ROOMS_INFO:
                this.loadRoomsInfo(action.payload);
            break;
            case ActionTypes.LOAD_USERS_INFO_IN_GROUP:
                this.loadUsersInfoInGroup(action.payload);
            break;
            default:
        }
    }

    viewGroup(payload) {
        info = payload;
        this.emit(VIEW_GROUP);
    }

    loadGroupsInfo(payload) {
        groups = payload;
        this.emit(LOAD_GROUPS_INFO);
    }

    loadRoomsInfo(payload) {
        rooms = payload;
        this.emit(LOAD_ROOMS_INFO);
    }

    loadUsersInfoInGroup(payload) {
        usersInfoInGroup = payload;
        this.emit(LOAD_USERS_INFO_IN_GROUP);
    }

    addViewGroupListener(callback) {
        this.on(VIEW_GROUP, callback)
    }

    removeViewGroupListener(callback) {
        this.removeListener(VIEW_GROUP, callback);
    }

    addLoadGroupsInfoListener(callback) {
        this.on(LOAD_GROUPS_INFO, callback);
    }

    removeLoadGroupsInfoListener(callback) {
        this.removeListener(LOAD_GROUPS_INFO, callback);
    }

    addLoadRoomsInfoListener(callback) {
        this.on(LOAD_ROOMS_INFO, callback);
    }

    removeLoadRoomsInfoListener(callback) {
        this.removeListener(LOAD_ROOMS_INFO,callback);
    }

    addLoadUsersInfoInGroupListener(callback) {
        this.on(LOAD_USERS_INFO_IN_GROUP, callback);
    }

    removeLoadUsersInfoInGroupListener(callback) {
        this.removeListener(LOAD_USERS_INFO_IN_GROUP, callback);
    }

    getGroups() {
        return groups;
    }

    getInfo() {
        return info;
    }

    getRooms() {
        return rooms;
    }

    getUsersInfoInGroup() {
        return usersInfoInGroup
    }
}

export default new GroupStore();
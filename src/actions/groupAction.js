import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { fetchSomething, localStorage } from '../something';

class GroupAction {
    createGroup(info, callback) {
        info.id = localStorage.get_Id();
        fetchSomething('/api/group', {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json',
                'x-access-token': localStorage.getToken()
            }),
            body: JSON.stringify(info)
        }, (response) => {
            if (response.err) return callback(response.err);
            return callback(null, response);
        })
    }

    joinGroup(payload, callback) {
        fetchSomething('/api/group/?code=' + payload.joinCode, {
            method: 'PUT',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            return callback(null, response);
        })
    }

    getRoomsInfo(payload, callback) {
        fetchSomething('/api/group/room?id=' + payload, {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            return callback(null, response);
        })
    }

    addNewRoom(payload, callback) {
        fetchSomething('/api/group/room', {
            method: 'POST',
            headers: new Headers({
                'Content-type': 'application/json',
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            }),
            body: JSON.stringify(payload)
        }, (response) => {
            if (response.err) return callback(response.err);
            return callback(null, response);
        })
    }

    loadGroupsInfo(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_GROUPS_INFO,
            payload: payload
        })
    }

    viewGroup(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.VIEW_GROUP,
            payload: payload
        })
    }

    loadRoomsInfo(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_ROOMS_INFO,
            payload: payload
        })
    }
    
    loadUsersInfoInGroup(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_USERS_INFO_IN_GROUP,
            payload: payload
        })
    }
}

export default new GroupAction();
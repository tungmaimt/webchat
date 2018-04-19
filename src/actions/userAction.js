import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { fetchSomething, localStorage } from '../something';

class UserAction {
    search(payload, callback) {
        fetchSomething('/api/user/search/' + payload, {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response.res);
        });
    }

    getInfo(payload, callback) {
        fetchSomething('/api/user', {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': payload
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response);
        });
    }

    getToView(payload, callback) {
        fetchSomething('/api/user/' + payload, {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response); 
        });
    }

    addFriend(payload, callback) {
        fetchSomething('/api/user/friend?id=' + payload + '&action=add', {
            method: 'PUT',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response);
        })
    }

    removeFriend(payload, callback) {
        fetchSomething('/api/user/friend?id=' + payload + '&action=remove', {
            method: 'PUT',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            })
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response);
        })
    }

    updateInfo(payload, callback) {
        fetchSomething('/api/user', {
            method: 'PUT',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id()
            }),
            body: payload
        }, (response) => {
            if (response.err) return callback(response.err);
            if (response.res === 'ok') callback(null, response);
        })
    }

    viewInfo(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.VIEW_INFO,
            payload: payload
        })
    }

    loadUserInfo(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_USER_INFO,
            payload: payload
        });
    }

    loadFriendInfo(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_FRIEND_INFO,
            payload: payload
        });
    }

    loadSearchResult(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.LOAD_SEARCH_RESULT,
            payload: payload
        })
    }

    changeSearchMode(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_SEARCH_MODE,
            payload: payload
        })
    }

    updateFriend(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.UPDATE_FRIEND,
            payload: payload
        })
    }
}

export default new UserAction();
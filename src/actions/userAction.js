import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { fetchSomething, localStorage } from '../something';

class UserAction {
    search(payload, callback) {
        // fetchSomething('/api/user/' + payload, {
        //     method: 'GET',
        //     headers: new Headers({
        //         'x-access-token': localStorage.getToken(),
        //         '_id': localStorage.get_Id(),
        //         'socketId': localStorage.getSocketId()
        //     })
        // }, (response) => {
        //     if (response.err) return callback(response.err);
        //     if (response.res === 'ok') callback(null, response.res);
        // });
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
}

export default new UserAction();
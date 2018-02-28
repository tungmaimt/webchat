import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { localStorage, fetchSomething } from '../something';

class LoginAction {
    login(payload, callback) {
        let _payload = payload;
        _payload.socketId = localStorage.getSocketId();
        fetchSomething('/api/user/oauth', {
            body: JSON.stringify(_payload),
            headers: new Headers({
                'content-type': 'application/json',
            }),
            method: 'POST',
            // mode: 'cors',
            // redirect: 'follow',
            // referrer: 'no-referrer',
        }, (response) => {
            if (response.err) return callback(response);
            if (response.res === 'ok') return callback(null, response);
        });
    }

    isLogin() {
        if (!localStorage.getToken()) return false;
    }

    changeLoginState(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_LOGIN_STAGE,
            payload: payload
        });
    }

    changeSignUpState(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_SIGN_UP_STATE,
            payload: payload
        })
    }

    signUp(payload, callback) {
        let _payload = payload;
        _payload.socketId = localStorage.getSocketId();
        fetchSomething('/api/user', {
            body: JSON.stringify(payload),
            headers: new Headers({
                'Content-type': 'application/json'
            }),
            method: 'POST'
        }, (response) => {
            if (response.err) return callback(response);
            if (response.res === 'ok') return callback(null, response);
        });
    }
}

export default new LoginAction();
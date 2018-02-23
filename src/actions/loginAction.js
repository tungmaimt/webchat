import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { socket, fetchSomething } from '../something';

class LoginAction {
    login(payload) {
        let _payload = payload;
        _payload.socketId = socket.id;
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
            if (response.res === 'ok') console.log('ok');
        });
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

    signUp(payload) {
        let _payload = payload;
        _payload.socketId = socket.id;
        fetchSomething('/api/user', {
            body: JSON.stringify(payload),
            headers: new Headers({
                'Content-type': 'application/json'
            }),
            method: 'POST'
        }, (response) => {
            if (response.res === 'ok') console.log('ok');
        });
    }
}

export default new LoginAction();
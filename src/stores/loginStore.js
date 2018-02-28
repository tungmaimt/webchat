import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { localStorage } from '../something';

const CHANGE_LOGIN_STAGE = 'CHANGE_LOGIN_STATE';
const CHANGE_SIGN_UP_STATE = 'CHANGE_SIGN_UP_STATE';
let islogin = localStorage.getToken ? true: false;
let isSignUp = false;

class UserStore extends EventEmitter {
    constructor() {
        super();

        Dispatcher.register(this.registerToAction.bind(this));
    }

    registerToAction(action) {
        switch(action.actionType) {
            case ActionTypes.CHANGE_LOGIN_STAGE:
                this.changeLoginState(action.payload);
            break;
            case ActionTypes.CHANGE_SIGN_UP_STATE:
                this.changeSignUpState(action.payload);
            break;
            default: 
        }
    }

    changeLoginState(payload) {
        islogin = payload;
        this.emit(CHANGE_LOGIN_STAGE);
    }

    changeSignUpState(payload) {
        isSignUp = payload;
        this.emit(CHANGE_SIGN_UP_STATE);
    }

    getLoginState() {
        return islogin;
    }

    getSignUpState() {
        return isSignUp;
    }

    addChangeLoginStateListener(callback) {
        this.on(CHANGE_LOGIN_STAGE, callback);
    }

    removeChangeLoginStateListener(callback) {
        this.removeListener(CHANGE_LOGIN_STAGE, callback);
    }

    addChangeSignUpStateListener(callback) {
        this.on(CHANGE_SIGN_UP_STATE, callback);
    }

    removeChangeSignUpStateListener(callback) {
        this.removeListener(CHANGE_SIGN_UP_STATE, callback);
    }

}

export default new UserStore();
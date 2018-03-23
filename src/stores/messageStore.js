import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

const CHANGE_CHATOBJ = 'CHANGE_CHATOBJ';
const CHANGE_CHATMESS = 'CHANGE_CHATMESS';

let chatObj = {};
let chatMess = [];

class MessageStore extends EventEmitter {
    constructor() {
        super()

        Dispatcher.register(this.registerToAction.bind(this));
    }

    registerToAction(action) {
        switch(action.actionType) {
            case ActionTypes.CHANGE_CHATOBJ:
                this.changeChatObj(action.payload);
            break;
            case ActionTypes.CHANGE_CHATMESS:
                this.changeChatMess(action.payload);
            break;
            case ActionTypes.MOVE_SCROLL:
                this.moveScroll(action.payload);
            break;
            default:
        }
    }

    changeChatMess(payload) {
        chatMess = payload;
        this.emit(CHANGE_CHATMESS);
    }

    changeChatObj(payload) {
        chatObj = payload;
        this.emit(CHANGE_CHATOBJ);
    }

    addChangeChatObjListener(callback) {
        this.on(CHANGE_CHATOBJ, callback);
    }

    removeChangeChatObjListener(callback) {
        this.removeListener(CHANGE_CHATOBJ, callback);
    }

    addChangeChatMessListener(callback) {
        this.on(CHANGE_CHATMESS, callback);
    }

    removeChangeChatMessListener(callback) {
        this.removeListener(CHANGE_CHATMESS, callback);
    }

    getChatObj() {
        return chatObj;
    }

    getChatMess() {
        return chatMess;
    }
}

export default new MessageStore();
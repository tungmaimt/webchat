import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { localStorage, fetchSomething, socket } from '../something';

class MessageAction {
    getMessage(payload, callback) {
        fetchSomething('/api/message', {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id(),
                'room': payload.room,
                'from': payload.from || -1,
                'to': payload.to || -1
            })
        }, (response) => {
            callback(response);
        });
    }

    sendMessage(payload, callback) {
        socket.emit('wcMessage', { 
            id: localStorage.get_Id(),
            token: localStorage.getToken(),
            room: payload.room,
            message: payload.message
        });
        callback();
    }

    changeChatObj(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_CHATOBJ,
            payload: payload
        });
    }

    changeChatMess(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_CHATMESS,
            payload: payload
        })
    }

    moveScroll(payload) {
        Dispatcher.dispatch({
            actionType: ActionTypes.MOVE_SCROLL,
            payload: payload
        })
    }
}

export default new MessageAction();
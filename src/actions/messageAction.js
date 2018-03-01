import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';
import { localStorage, fetchSomething, socket } from '../something';

class MessageAction {
    getFriendMessage(payload, callback) {
        fetchSomething('/api/message', {
            method: 'GET',
            headers: new Headers({
                'x-access-token': localStorage.getToken(),
                '_id': localStorage.get_Id(),
                'friend_id': payload.friendId,
                'from': payload.from || Date.now() - 10*24*60*60*1000,
                'to': payload.to || Date.now()
            })
        }, (response) => {
            callback(response);
        });
    }

    sendFriendMessage(payload, callback) {
        socket.emit('wcMessage', { 
            id: localStorage.get_Id(),
            token: localStorage.getToken(),
            friend_id: payload.friendId,
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
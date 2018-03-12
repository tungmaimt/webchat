import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

class AdjustAction {
    changShowSetting(isShow) {
        Dispatcher.dispatch({
            actionType: ActionTypes.CHANGE_SHOW_SETTING,
            payload: isShow
        })
    }
}

export default new AdjustAction();
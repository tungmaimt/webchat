import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import ActionTypes from '../constants';

const CHANGE_SHOW_SETTING = 'CHANGE_SHOW_SETTING';
let isShowSetting = false;

class AdjustStore extends EventEmitter {

    constructor() {
        super();

        Dispatcher.register(this.registerToAction.bind(this));
    }

    registerToAction(action) {
        switch (action.actionType) {
            case ActionTypes.CHANGE_SHOW_SETTING:
                this.changeShowSetting(action.payload);
            break;
            default:
        }
    }

    changeShowSetting(payload) {
        isShowSetting = payload;
        this.emit(CHANGE_SHOW_SETTING);
    }

    addChangeShowSettingListener(callback) {
        this.on(CHANGE_SHOW_SETTING, callback);
    }

    removeChangeShowSettingListener(callback) {
        this.removeListener(CHANGE_SHOW_SETTING, callback);
    }

    getIsShowSetting() {
        return isShowSetting;
    }
}

export default new AdjustStore();
import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher';
import someAction from '../actions/constants';

const CHANGE = 'CHANGE';
let someStore = [];

class SomethingStore extends EventEmitter {
    constructor() {
        super();

        Dispatcher.register(this.registerToActions.bind(this));
    }

    registerToActions(action) {
        switch(action.actionType) {
            case someAction:
                this.something(action.payload);
            break;
        }
    }

    something(some) {
        someStore.push(some);
        this.emit(CHANGE);
    }

    addSomeListener(callback) {
        this.on(CHANGE, callback);
    }

    removeSomeListener(callback) {
        this.removeListener(CHANGE, callback);
    }
}

export default new SomethingStore();
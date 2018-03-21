import React, { Component } from 'react';
import './style.css';
import Userinfo from '../Userinfo';
import TabSwitch from '../TabSwitch';
import userAction from '../../actions/userAction';
import loginAction from '../../actions/loginAction';
import loginStore from '../../stores/loginStore';
import { localStorage, registerHandleResponse, removeHandleResponse } from '../../something';

class Asidebar extends Component {
    constructor() {
        super();

        this.state = {
            isLogin: loginStore.getLoginState(),
        }
    }

    componentWillMount() {
        loginStore.addChangeLoginStateListener(() => {
            this.setState({
                isLogin: loginStore.getLoginState()
            });
        });

        registerHandleResponse('loadUserInfo', (result) => {
            if (!result.success) {
                return console.log('something wrong');
            }
            userAction.loadUserInfo(result.result);
        });
    }
    
    componentWillUnmount() {
        loginStore.removeChangeLoginStateListener(() => {
            this.setState({
                isLogin: loginStore.getLoginState()
            });
        });

        removeHandleResponse('loadUserInfo', (result) => {
            if (!result.success) {
                return console.log('something wrong');
            }
            userAction.loadUserInfo(result.result);
        });
    }

    componentDidMount() {
        if (this.state.isLogin) {
            if (localStorage.get_Id()) {
                userAction.getInfo(localStorage.get_Id(), (err, response) => {
                    if (err) {
                        if (err.name === 'JsonWebTokenError') {
                            loginAction.changeLoginState(false);
                        }
                    }
                });
            }
            else loginAction.changeLoginState(false);
        } else loginAction.changeLoginState(false);
    }

    render() {
        return (
            <div className="asidebar">
                <Userinfo />
                <TabSwitch />
            </div>
        );
    }
}

export default Asidebar;
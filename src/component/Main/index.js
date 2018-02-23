import React, { Component } from 'react';
import './style.css';
// import { BrowserRouter, Router, Link } from 'react-router-dom';
import ChatWindow from '../ChatWindow';
import InputMessage from '../InputMessage';
import LoginForm from '../LoginForm';
import SignUpForm from '../SignUpForm';
import userStore from '../../stores/loginStore';

const localStore = window.localStorage;

class Main extends Component {
    constructor() {
        super();

        this.state = {  
            isLogin: this.checkIsLogin(),
        }
    }

    checkIsLogin() {
        if (localStorage.wcToken) return true;
        else return false;
    }

    componentDidMount() {
        // userStore.addChangeListener(() => {
        //     this.setState({
        //         isLogin: userStore.getLoginState()
        //     });
        //     console.log(userStore.getLoginState());
        // })
    }

    componentWillMount() {
        userStore.addChangeLoginStateListener(() => {
            this.setState({
                isLogin: userStore.getLoginState()
            });
        });
    }

    componentWillUnmount() {
        userStore.removeChangeLoginStateListener(() => {
            this.setState({
                isLogin: userStore.getLoginState()
            });
        });
    }

    render() {
        return (
            <div className="main">
                <ChatWindow />
                <InputMessage />
            </div>
        );
    }
}

export default Main;
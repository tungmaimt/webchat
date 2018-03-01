import React, { Component } from 'react';
import './style.css';
import ChatWindow from '../ChatWindow';
import InputMessage from '../InputMessage';
// import { localStorage, fetchSomething } from '../../something/'

class Main extends Component {

    // checkIsLogin() {
    //     if (!localStorage.getToken()) return false;
    //     else {
    //         fetchSomething()
    //     }
    // }

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
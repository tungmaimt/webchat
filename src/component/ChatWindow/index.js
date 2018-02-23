import React, { Component } from 'react';
import './style.css';

class ChatWindow extends Component {

    messages() {
        return (
            <li><img src="" alt="ava"/> some messages</li>
        )
    }

    render() {
        return (
            <div className="chat-window">
            <div className="top">
                <div className="title">some title</div>
                <i className="fas fa-cog setting-icon"></i>
            </div>
            <ul>{this.messages()}</ul>
            </div>
        );
    }
}

export default ChatWindow;
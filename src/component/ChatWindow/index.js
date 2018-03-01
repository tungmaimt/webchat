import React, { Component } from 'react';
import './style.css';
import messageStore from '../../stores/messageStore';
import { registerHandleResponse, removeHandleResponse } from '../../something';
import messageAction from '../../actions/messageAction';


class ChatWindow extends Component {

    constructor() {
        super()

        this.state = {
            chatMess: [],
            title: ''
        }
    }

    componentWillMount() {
        messageStore.addChangeChatMessListener(() => {
            this.setState({
                chatMess: messageStore.getChatMess()
            });
            this.moveScroll()
        });

        messageStore.addChangeChatObjListener(() => {
            this.setState({
                title: messageStore.getChatObj().info.name
            })
        })

        registerHandleResponse('directMessage', (result) => {
            if (!result.success) {
                console.log('cant get direct message');
                return console.log(result);
            }
            let chatMess = this.state.chatMess;
            chatMess.push(result.result);
            messageAction.changeChatMess(chatMess);
        });

        registerHandleResponse('loadFriendMessages', this.loadFriendMessages);
    }

    loadFriendMessages(result) {
        if (!result.success) {
            console.log('cant load message');
            return console.log(result);
        }
        messageAction.changeChatMess(result.result);
    }

    componentWillUnmount() {
        messageStore.removeChangeChatMessListener(() => {
            this.setState({
                chatMess: messageStore.getChatMess()
            });
            this.moveScroll();
        });

        messageStore.removeChangeChatObjListener(() => {
            this.setState({
                title: messageStore.getChatObj().info.name
            })
        })

        removeHandleResponse('directMessage', (result) => {
            if (!result.success) {
                console.log('cant get direct message');
                return console.log(result);
            }
            let chatMess = this.state.chatMess;
            chatMess.push(result.result);
            messageAction.changeChatMess(chatMess);
        });

        removeHandleResponse('loadFriendMessages', this.loadFriendMessages)
    }

    moveScroll() {
        let chatContent = document.getElementsByClassName('chat-content');
        if (chatContent[0].scrollTop) chatContent[0].scrollTop = chatContent[0].scrollHeight;
    }

    render() {
        const listMessage = this.state.chatMess.map((item, index) => {
            return <li key={index}>{item.contents}</li>
        })

        return (
            <div className="chat-window">
            <div className="top">
                <div className="title">{this.state.title || 'Title'}</div>
                <div className="btn">
                    <i className="fas fa-cog setting-icon"></i>
                </div>
            </div>
            <div className="chat-co ntent">
                <ul>
                    {listMessage}
                </ul>
            </div>
            </div>
        );
    }
}

export default ChatWindow;

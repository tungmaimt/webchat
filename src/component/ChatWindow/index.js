import React, { Component } from 'react';
import './style.css';
import messageStore from '../../stores/messageStore';
import { registerHandleResponse, removeHandleResponse, localStorage } from '../../something';
import messageAction from '../../actions/messageAction';

let smooth = true;

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
            this.moveScroll();
            smooth = true;
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
        smooth = false;
        messageAction.changeChatMess(result.result);
    }

    componentWillUnmount() {
        messageStore.removeChangeChatMessListener(() => {
            this.setState({
                chatMess: messageStore.getChatMess()
            });
            this.moveScroll();
            smooth = true;
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
        // chatContent[0].scrollTop = chatContent[0].scrollHeight;
        chatContent[0].scroll({
            top: chatContent[0].scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        })
    }

    render() {
        const listMessage = this.state.chatMess.map((item, index) => {
            let own = item.sender === localStorage.get_Id() ? true : false
            let da = new Date(item.created_date).toLocaleTimeString();
            return (
                <Message key={index} own={own} message={item.contents} date={da} />
            )
        })

        return (
            <div className="chat-window">
            <div className="top">
                <div className="title">{this.state.title || 'Title'}</div>
                <div className="btn">
                    <i className="fas fa-cog setting-icon"></i>
                </div>
            </div>
            <div className="chat-content">
                <ul>
                    { listMessage }
                </ul>
            </div>
            </div>
        );
    }
}

const Message = ({ own, active, message, date }) => {
    return (
        <div className={`message-box ${own? 'own' : ''} ${active? 'active' : ''}`}>
            <img className="ava" src="/static/media/default_ava.cf22e533.jpg" alt=""/>
            <div className="message">{message}</div>
            <div className="info">{date}</div>
        </div>
    )
}

export default ChatWindow;

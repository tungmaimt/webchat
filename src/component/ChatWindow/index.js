import React, { Component } from 'react';
import './style.css';
import messageStore from '../../stores/messageStore';
import { registerHandleResponse, removeHandleResponse, localStorage } from '../../something';
import messageAction from '../../actions/messageAction';
import Modal from '../Modal';
import adjustStore from '../../stores/adjustStore';

let smooth = true;

class ChatWindow extends Component {

    constructor() {
        super()

        this.state = {
            chatMess: [],
            title: '',
            showSetting: false,
            room: ''
        }

        this.loadDirectMessage = this.loadDirectMessage.bind(this);
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
                title: messageStore.getChatObj().name || messageStore.getChatObj().info.name,
                room: messageStore.getChatObj().room ? messageStore.getChatObj().room.id : messageStore.getChatObj()._id
            })
        });

        adjustStore.addChangeShowSettingListener(() => {
            this.setState({
                showSetting: adjustStore.getIsShowSetting()
            });
        })

        registerHandleResponse('directMessage', this.loadDirectMessage);

        registerHandleResponse('loadMessages', this.loadMessages);
    }

    loadMessages(result) {
        if (!result.success) {
            console.log('cant load message');
            return console.log(result);
        }
        smooth = false;
        messageAction.changeChatMess(result.result);
    }

    loadDirectMessage(result) {
        if (!result.success) {
            console.log('cant get direct message');
            return console.log(result);
        }
        if (this.state.room === '') {
            console.log(this.state.room);
            console.log(result.result.room);
            return console.log('eu phai thang nay');
        }
        let chatMess = this.state.chatMess.slice();
        chatMess.push(result.result);
        messageAction.changeChatMess(chatMess);
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
        });

        adjustStore.removeChangeShowSettingListener(() => {
            this.setState({
                showSetting: adjustStore.getIsShowSetting()
            });
        })

        removeHandleResponse('directMessage', this.loadDirectMessage);

        removeHandleResponse('loadMessages', this.loadMessages)
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
        const lm = this.state.chatMess.slice();
        const listMessage = lm.map((item, index) => {
            let own = item.sender + '' === localStorage.get_Id() + '' ? true : false
            let da = new Date(item.created_date).toLocaleTimeString();
            return (
                <Message key={index} own={own} message={item.contents} date={da} />
            )
        })

        return (
            <div className="chat-window">
            <div className="top">
                <div className="title">{this.state.title || 'Title'}</div>
                <div className="btn" onClick={() => {
                    this.setState({ showSetting: true });
                }}>
                    <i className="fas fa-cog setting-icon"></i>
                </div>
            </div>
            <div className="chat-content">
                <ul>
                    { listMessage }
                </ul>
            </div>
            <Modal isOpen={this.state.showSetting} title={this.state.title + ' setting'}>
                <div>some</div>
            </Modal>
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

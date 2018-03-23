import React, { Component } from 'react';
import './style.css';
import messageAction from '../../actions/messageAction';
import messageStore from '../../stores/messageStore';

class InputMessage extends Component {

    constructor() {
        super()

        this.state = {
            inputMessage: '',
            chatObj: {},
            room: ''
        }

        this.sendFriendMessage = this.sendFriendMessage.bind(this);
        this.pressFriendMessage = this.pressFriendMessage.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    componentWillMount() {
        messageStore.addChangeChatObjListener(() => {
            this.setState({
                chatObj: messageStore.getChatObj(),
                room: messageStore.getChatObj().room ? messageStore.getChatObj().room.id : messageStore.getChatObj()._id
            });
        });
    }

    componentDidMount() {
        this.btnPlane.addEventListener('click', () => {
            this.sendFriendMessage(this.state.inputMessage);
        })
    }

    componentWillUnmount() {
        messageStore.removeChangeChatObjListener(() => {
            this.setState({
                chatObj: messageStore.getChatObj(),
                room: messageStore.getChatObj().room ? messageStore.getChatObj().room.id : messageStore.getChatObj()._id
            });
            console.log(this.state.room);
        })
        this.btnPlane.removeEventListener('click', () => {
            this.sendFriendMessage(this.state.inputMessage);
        })
    }

    updateInput(event) {
        let field = event.target.name;
        this.setState({
            [field]: event.target.value
        });
    }

    moveScroll() {
        let chatContent = document.getElementsByClassName('chat-content');
        // chatContent[0].scrollTop = chatContent[0].scrollHeight;
        chatContent[0].scroll({
            top: chatContent[0].scrollHeight,
            behavior: 'smooth'
        });
    }

    pressFriendMessage(event) {
        let key = event.keyCode;
        if (key === 13) {
            let mes = this.state.inputMessage.substring(0, this.state.inputMessage.length - 1);
            this.sendFriendMessage(mes);
        }
    }

    sendFriendMessage(mess) {
        let mes = mess;
        if (mess) {
            mes = mess;
        }

        if (!this.state.chatObj.room && !this.state.chatObj._id) {
            this.setState({
                inputMessage: ''
            })
            return;
        }

        if (mes !== '') {
            let payload = {
                room: this.state.room,
                message: mes
            };
            messageAction.sendMessage(payload, () => {
                // console.log(payload);
            });
        } 

        this.setState({
            inputMessage: ''
        });
        this.moveScroll();
    }

    render() {
        return (
            <div className="input-message">
                <textarea name='inputMessage'
                    onChange={this.updateInput}
                    value={this.state.inputMessage}
                    type='text'
                    onKeyUp={this.pressFriendMessage}
                ></textarea>

                <div className="btn">
                    <i className="far fa-smile"></i>
                </div>
                <div className="btn" 
                    ref={(some) => {this.btnPlane = some}}
                >
                    <i className="fab fa-telegram-plane"></i>
                </div>
            </div>
        );
    }
}

export default InputMessage

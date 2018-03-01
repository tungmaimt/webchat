import React, { Component } from 'react';
import './style.css';
import messageAction from '../../actions/messageAction';
import messageStore from '../../stores/messageStore';

class InputMessage extends Component {

    constructor() {
        super()

        this.state = {
            inputMessage: '',
            chatObj: {}
        }

        this.sendFriendMessage = this.sendFriendMessage.bind(this);
        this.pressFriendMessage = this.pressFriendMessage.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    componentWillMount() {
        messageStore.addChangeChatObjListener(() => {
            this.setState({
                chatObj: messageStore.getChatObj()
            });
        });
    }

    componentDidMount() {
        console.log(this.btnPlane);
        this.btnPlane.addEventListener('onclick', () => {
            console.log('kekekek');
        })
    }

    componentWillUnmount() {
        messageStore.removeChangeChatObjListener(() => {
            this.setState({
                chatObj: messageStore.getChatObj()
            })
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
        chatContent[0].scrollTop = chatContent[0].scrollHeight;
    }

    pressFriendMessage(event) {
        console.log(event.keyCode);
        let key = event.keyCode;
        if (key === 13) {
            this.sendFriendMessage();
            // messageAction.moveScroll('bottom');
        }
    }

    sendFriendMessage() {
        let payload = {
            friendId: this.state.chatObj.id,
            message: this.state.inputMessage
        }
        messageAction.sendFriendMessage(payload, () => {
            console.log(payload);
        });

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

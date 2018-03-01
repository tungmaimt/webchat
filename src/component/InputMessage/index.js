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
        this.updateInput = this.updateInput.bind(this);
    }

    componentWillMount() {
        messageStore.addChangeChatObjListener(() => {
            this.setState({
                chatObj: messageStore.getChatObj()
            });
        });
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

    sendFriendMessage(event) {
        let key = event.charCode;
        if (key === 13) {
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
            // messageAction.moveScroll('bottom');
        }
    }

    render() {
        return (
            <div className="input-message">
                <textarea name='inputMessage'
                    onChange={this.updateInput}
                    value={this.state.inputMessage}
                    type='text'
                    onKeyPress={this.sendFriendMessage}
                ></textarea>

                <div className="btn">
                    <i className="far fa-smile"></i>
                </div>
                <div className="btn">
                    <i className="fab fa-telegram-plane"></i>
                </div>
            </div>
        );
    }
}

export default InputMessage

import React, { Component } from 'react';
import './style.css';
import messageAction from '../../actions/messageAction';
import messageStore from '../../stores/messageStore';
import emo from '../../emo';

class InputMessage extends Component {

    constructor() {
        super()

        this.state = {
            inputMessage: '',
            chatObj: {},
            room: '',
            isShowEmoList: false,
            emoType: 1,
        }

        this.sendFriendMessage = this.sendFriendMessage.bind(this);
        this.pressFriendMessage = this.pressFriendMessage.bind(this);
        this.showEmoList = this.showEmoList.bind(this);
        this.selectEmoType = this.selectEmoType.bind(this);
        this.insertEmo = this.insertEmo.bind(this);
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
            messageAction.sendMessage(payload, (err, response) => {
                // console.log(payload);
            });
        } 

        this.setState({
            inputMessage: ''
        });
        this.moveScroll();
    }

    showEmoList() {
        this.setState({
            isShowEmoList: !this.state.isShowEmoList
        })
    }

    selectEmoType(type) {
        this.setState({
            emoType: type
        })
    }

    insertEmo(emo) {
        console.log(emo);
        this.setState({
            inputMessage: this.state.inputMessage + emo
        })
    }

    render() {
        const listEmo = emo[this.state.emoType].emoj.map((item, index) => {
            return <td 
                id={"emoj-" + index} 
                key={index} 
                className="emo-item"
                ref={"emoj-" + index}
                onClick={() => {this.insertEmo(item)}}
            >
                {item}
            </td>
        });

        return (
            <div className="input-message">
                <textarea name='inputMessage'
                    onChange={this.updateInput}
                    value={this.state.inputMessage}
                    type='text'
                    onKeyUp={this.pressFriendMessage}
                ></textarea>

                <div className="btn" onClick={this.showEmoList}>
                    <i className="far fa-smile"></i>
                </div>
                <div className="btn" 
                    ref={(some) => {this.btnPlane = some}}
                >
                    <i className="fab fa-telegram-plane"></i>
                </div>
                <div className={this.state.isShowEmoList ? "emo-list" : "hide"}>
                    <div>
                        <ul>
                            <li id="emo-type-1" onClick={() => {this.selectEmoType(0)}}>bear</li>
                            <li id="emo-type-2" onClick={() => {this.selectEmoType(1)}}>angry</li>
                            <li id="emo-type-3" onClick={() => {this.selectEmoType(2)}}>why</li>
                            <li id="emo-type-4" onClick={() => {this.selectEmoType(3)}}>bow</li>
                        </ul>
                        <div>
                            <table>
                                <tbody>
                                <tr>
                                    {listEmo.slice(0, 3)}
                                </tr>
                                <tr>
                                    {listEmo.slice(3, 6)}
                                </tr>
                                <tr>
                                    {listEmo.slice(6, 9)}
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default InputMessage

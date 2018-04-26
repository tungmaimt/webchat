import React, { Component } from 'react';
import SimplePeer from 'simple-peer';
import './style.css';
import messageStore from '../../stores/messageStore';
import { registerHandleResponse, removeHandleResponse, localStorage, removeAllhandleResponse } from '../../something';
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
            room: '',
            objectType: -1,
            isOpenVideoCall: false,
            notify: ''
        }

        this.somePeer = {};

        this.loadDirectMessage = this.loadDirectMessage.bind(this);
        this.startVideoCall = this.startVideoCall.bind(this);
        this.answerVideoCall = this.answerVideoCall.bind(this);
        this.endVideoCall = this.endVideoCall.bind(this);
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
            if (messageStore.getChatObj().info) {
                this.setState({
                    objectType: 0,
                    title: messageStore.getChatObj().info.name,
                    room: messageStore.getChatObj().room.id
                })
            } else {
                this.setState({
                    objectType: 1,
                    title: messageStore.getChatObj().name,
                    room: messageStore.getChatObj()._id
                })
            }
            
        });

        adjustStore.addChangeShowSettingListener(() => {
            this.setState({
                showSetting: adjustStore.getIsShowSetting()
            });
        })

        registerHandleResponse('directMessage', this.loadDirectMessage);

        registerHandleResponse('loadMessages', this.loadMessages);

        registerHandleResponse('offer', this.answerVideoCall);
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
        console.log(result);
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

        removeHandleResponse('loadMessages', this.loadMessages);

        removeHandleResponse('offer', this.answerVideoCall)
    }

    answerVideoCall(result) {
        console.log('offer');
        console.log(result);
        if (!result.success) return console.log('errr', result);
        navigator.getUserMedia(
            { video: true, audio: true },
            (stream) => {
                this.somePeer = new SimplePeer({ trickle: false, stream: stream });

                this.somePeer.on('signal', (data) => {
                    console.log('data');
                    let payload = {
                        id: result.result.id,
                        data
                    }
                    messageAction.answerVideoCall(payload, () => {
                        console.log(payload);
                    })
                });

                this.somePeer.on('stream', (stream) => {
                    console.log('stream');
                    let video = this.refs.videoCallWindow;
                    video.src = window.URL.createObjectURL(stream);
                    this.setState({ isOpenVideoCall: true });
                    video.play();
                })

                this.somePeer.signal(result.result.data);
            },
            (err) => {
                if (err) return console.log(err);
            }
        )
        
    }

    startVideoCall() {
        if (this.state.objectType !== 0) {
            return console.log('eu');
        } 
        console.log(this.refs.videoCallWindow);
        navigator.getUserMedia(
            { video: true, audio: true },
            (stream) => {
                this.somePeer = new SimplePeer({ initiator: true, stream: stream, trickle: false });

                registerHandleResponse('answer', (result) => {
                    console.log('answer');
                    console.log(result);
                    this.somePeer.signal(result.result.data);
                });

                this.somePeer.on('signal', (data) => {
                    let payload = {
                        id: messageStore.getChatObj().id,
                        data
                    }
                    messageAction.startVideoCall(payload, () => {
                        console.log(payload);
                    })
                });

                this.somePeer.on('stream', (stream) => {
                    console.log('stream');
                    let video = this.refs.videoCallWindow;
                    video.src = window.URL.createObjectURL(stream);
                    this.setState({ isOpenVideoCall: true });
                    video.play();
                })
            },
            (err) => {
                if (err) console.log(err);
            }
        )
    }

    

    endVideoCall() {
        this.somePeer.destroy();
        removeAllhandleResponse('answer', () => {
            console.log('do nothing');
        })
        console.log('end');
        this.setState({ isOpenVideoCall: false });
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
                <Message key={index} own={own} message={item.contents} date={da} ava={item.infoAva || 'default_ava.jpg'}/>
            )
        })

        return (
            <div className="chat-window">
            <div className="top">
                <div className="title">{this.state.title || 'Title'}</div>
                <div 
                    className={this.state.objectType !== 0 ? "btn hide" : "btn"} 
                    onClick={() => {
                        this.startVideoCall()
                    }}
                >
                    <i className="fas fa-video"></i>
                </div>
                <div className={this.state.objectType === -1 ? "btn hide" : "btn"} onClick={() => {
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
            <Modal isOpen={this.state.isOpenVideoCall} title={this.state.title}>
                <video width="400" ref="videoCallWindow"></video>
                <div onClick={() => {
                    this.endVideoCall();
                }}
                >
                    end call
                </div>
                <div>{this.state.notify}</div>
            </Modal>
            </div>
        );
    }
}

const Message = ({ own, active, message, date, ava }) => {
    return (
        <div className={`message-box ${own? 'own' : ''} ${active? 'active' : ''}`}>
            <img className="ava" src={"http://localhost:3000/" + ava} alt=""/>
            <div className="message">{message}</div>
            <div className="info">{date}</div>
        </div>
    )
}

export default ChatWindow;

import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import userAction from '../../actions/userAction';
import messageAction from '../../actions/messageAction';
import { registerHandleResponse, removeHandleResponse } from '../../something';


class Contacts extends Component {
    constructor() {
        super();

        this.state = {
            friends: []
        }

        this.chooseItem = this.chooseItem.bind(this);
    }

    componentWillMount() {
        // userStore.addLoadUserInfoListener(() => {
        //     this.setState({
        //         friends: userStore.getUserInfo().friends
        //     })
        // });

        userStore.addLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
        })

        registerHandleResponse('loadFriendsInfo', (result) => {
            if (!result.success) {
                console.log(result);
                return console.log('cant get friend info');
            }
            userAction.loadFriendInfo(result.result);
        });
    }

    componentWillUnmount() {
        // userStore.removerLoadUserInfoListener(() => {
        //     this.setState({
        //         friends: userStore.getUserInfo().friends
        //     })
        // });

        userStore.removerLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
        })

        removeHandleResponse('loadFriendsInfo', (result) => {
            if (!result.success) {
                console.log(result);
                return console.log('cant get friend info');
            }
            console.log(result);
            userAction.loadFriendInfo(result.result);
        });
    }

    chooseItem(event) {
        let payload = {
            friendId: event.target.getAttribute('ma')
        }
        console.log(this.state.friends[event.target.id]);
        messageAction.changeChatObj(this.state.friends[event.target.id]);
        messageAction.getFriendMessage(payload, (response) => {
            console.log(response);
        })
    }

    render() {
        return (
            <ul>
                {this.state.friends.map((item, index) => {
                    return (<li key={item.id} id={index} ma={item.id} onClick={this.chooseItem}>{item.info.name}</li>)
                })}
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
            </ul>
        )
    }
}

const Contact = ({ username, online }) => {
    return (
        <li className="contact-item">
            <img className="ava" src="/static/media/default_ava.cf22e533.jpg" alt="ava"/>
            <div className="contact-content">
                <div className="username">{username}</div>
                <div className="contact-message">recent message</div>
            </div>
            <div className="dot active">
                <i className="fas fa-circle"></i>
            </div>
        </li>
    )
}

export default Contacts

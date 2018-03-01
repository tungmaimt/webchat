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

    componentDidMount() {
        
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

    chooseItem(ma, id) {
        let payload = {
            friendId: ma
        }
        console.log(ma);
        messageAction.changeChatObj(this.state.friends[id]);
        messageAction.getFriendMessage(payload, (response) => {
            console.log(response);
        })
    }

    render() {
        const listItem = this.state.friends.map((item, index) => {
            return (
                <Contact key={index} id={index} username={item.info.name} online={true} ma={item.id} onClick={this.chooseItem}/>
            )
        });

        return (
            <ul>
                {/* {this.state.friends.map((item, index) => {
                    return (<li key={item.id} id={index} ma={item.id} onClick={this.chooseItem}>{item.info.name}</li>)
                })} */}
                {listItem}
                {/* <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} />
                <Contact username="huong" online={true} /> */}
            </ul>
        )
    }
}

const Contact = ({ username, online, ma, onClick, id }) => {
    return (
        <li className="contact-item" ma={ma} onClick={() => {onClick(ma, id)}}>
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

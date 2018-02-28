import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import userAction from '../../actions/userAction';
import { registerHandleResponse, removeHandleResponse } from '../../something';


class Contacts extends Component {
    constructor() {
        super();

        this.state = {
            friends: []
        }
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
            console.log(result);
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

    chat(event) {
        console.log(event.target.getAttribute('ma'));
    }

    render() {
        return (
            <ul>Contacts
                {console.log(this.state.friends)}
                {this.state.friends.map((item) => {
                    return (<li key={item.id} id={item.id} ma={item.id} onClick={this.chat}>{item.info.name}</li>)
                })}
            </ul>
        )
    }
}

export default Contacts
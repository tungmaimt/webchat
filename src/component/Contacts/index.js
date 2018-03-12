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
            friends: [],
            searchResult: []
        }

        this.chooseItem = this.chooseItem.bind(this);
    }

    handleResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('cant get friend info');
        }
        userAction.loadFriendInfo(result.result);
    }

    componentWillMount() {
        userStore.addLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
        });

        userStore.addLoadSearchResultListener(() => {
            this.setState({
                searchResult: userStore.getSearchResult()
            });
            console.log(userStore.getSearchResult());
        });

        registerHandleResponse('loadFriendsInfo', this.handleResponse);
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        userStore.removerLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
        });

        userStore.addLoadSearchResultListener(() => {
            this.setState({
                searchResult: userStore.getSearchResult()
            })
        });

        removeHandleResponse('loadFriendsInfo', this.handleResponse);
    }

    chooseItem(ma, id) {
        let payload = {
            friendId: ma
        }
        messageAction.changeChatObj(this.state.friends[id]);
        messageAction.getFriendMessage(payload, (response) => {
            if (response.res !== 'ok') {
                console.log(response);
            }
        })
    }

    viewInfo(ma, id) {
        console.log('gpgp');
    }

    render() {
        const listItem = !userStore.getSearchMode() ? this.state.friends.map((item, index) => {
            return (
                <Contact key={index} 
                    id={index} 
                    username={item.info.name} 
                    online={true} 
                    ma={item.id} 
                    onClick={this.chooseItem}
                    viewInfo={this.viewInfo}
                />
            )
        }) : this.state.searchResult.map((item, index) => {
            return (
                <Contact key={index}
                    id={index}
                    username={item.info.name}
                    online={false}
                    ma={item.id}
                    onClick={this.viewInfo}
                    viewInfo={false}
                />
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

const Contact = ({ username, online, ma, onClick, id, viewInfo }) => {
    return (
        <li className="contact-item" ma={ma} >
            <div className="contact-view" onClick={() => {onClick(ma, id)}}>
                <img className="ava" src="/static/media/default_ava.cf22e533.jpg" alt="ava"/>
                <div className="contact-content">
                    <div className="username">{username}</div>
                    <div className="contact-message">recent message</div>
                </div>
                <div className={online ? "dot active" : "dot deactive"}>
                    <i className="fas fa-circle"></i>
                </div>
            </div>
            <div className={viewInfo ? "option" : "hide"} onClick={() => {viewInfo ? viewInfo(ma, id) : {}}}>
                 <i className="fas fa-ellipsis-v"></i>
            </div>
        </li>
    )
}

export default Contacts

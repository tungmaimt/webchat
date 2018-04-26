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
            searchResult: [],
            userInfo: {}
        }

        this.chooseItem = this.chooseItem.bind(this);
        this.viewInfo = this.viewInfo.bind(this);
    }

    handleLoadFriendInfoResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('cant get friend info');
        }
        userAction.loadFriendInfo(result.result);
    }

    handleGetToViewResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('something worng');
        }
        userAction.viewInfo(result.result);
    }

    componentWillMount() {
        userStore.addLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
            if (this.state.userInfo.id) {
                let tem = this.state.friends;
                this.state.userInfo.friends.forEach((element, index) => {
                    tem.forEach((element1, index) => {
                        if (element.id === element1.id) {
                            element1.room = element.room;
                            element1.inv = element.track;
                            this.setState({
                                friends: tem
                            });
                        }
                    })
                });
            }
        });

        userStore.addLoadSearchResultListener(() => {
            this.setState({
                searchResult: userStore.getSearchResult()
            });
        });

        userStore.addLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo()
            })
        })

        registerHandleResponse('loadFriendsInfo', this.handleLoadFriendInfoResponse);
        registerHandleResponse('getToView', this.handleGetToViewResponse);
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        userStore.removerLoadFriendInfoListener(() => {
            this.setState({
                friends: userStore.getFriendInfo()
            })
        });

        userStore.removerLoadSearchResultListener(() => {
            this.setState({
                searchResult: userStore.getSearchResult()
            })
        });

        userStore.removerLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo()
            })
        })

        removeHandleResponse('loadFriendsInfo', this.handleLoadFriendInfoResponse);
        removeHandleResponse('getToView', this.handleGetToViewResponse);
    }

    chooseItem(ma, id, room) {
        let payload = {
            room: room.id
        }
        messageAction.changeChatObj(this.state.friends[id]);
        messageAction.getMessage(payload, (response) => {
            if (response.res !== 'ok') {
                console.log(response);
            }
        })
        console.log(this.state.friends[id].room);
    }

    viewInfo(ma, id) {
        userAction.getToView(ma, (err, response) => {
            if (err) return console.log(err);
        })
    }

    render() {
        if (this.state.userInfo.id && this.state.friends.length > 0) {

        }

        const listItem = !userStore.getSearchMode() ? this.state.friends.map((item, index) => {
            return (
                <Contact key={index}
                    room={item.room}
                    id={index} 
                    username={item.info.name} 
                    online={true} 
                    ma={item.id} 
                    onClick={this.chooseItem}
                    viewInfo={this.viewInfo}
                    optId={this.state.optId === '' ? '' : index}
                    inv={item.inv}
                    ava={'http://localhost:3000/' + (item.info.ava || 'default_ava.jpg')}
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
                    optId={this.state.optId === '' ? '' : index}
                    ava={'http://localhost:3000/' + (item.info.ava || 'default_ava.jpg')}
                />
            )
        });

        return (
            <ul>
                {/* {this.state.friends.map((item, index) => {
                    return (<li key={item.id} id={index} ma={item.id} onClick={this.chooseItem}>{item.info.name}</li>)
                })} */}
                {listItem}
                {/* <Contact username="huong" online={true} id={0} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={1} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={2} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={3} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={4} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={5} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/>
                <Contact username="huong" online={true} id={6} ma={2} onClick={this.viewInfo} viewInfo={this.viewInfo} optId={this.state.optId}/> */}
            </ul>
        )
    }
}

const Contact = ({ room, username, online, ma, onClick, id, viewInfo, optId, inv, ava }) => {
    return (
        <li className="contact-item" ma={id} >
            <div className="contact-view" onClick={() => {onClick(ma, id, room)}}>
                <img className="ava" src={ava} alt="ava"/>
                <div className="contact-content">
                    <div className="username">{username}</div>
                    <div className={inv === 0 ? "hide" : "contact-message"}>
                        {inv === -1 ? 'wait for reply' : inv === -2 ? username + ' want to add friend' : 'some'}
                    </div>
                </div>
                <div className={online ? "dot active" : "dot deactive"}>
                    <i className="fas fa-circle"></i>
                </div>
            </div>
            <div className={viewInfo ? "option" : "hide"} onClick={() => {viewInfo ? viewInfo(ma, id) : console.log('object')}}>
                 <i className="fas fa-ellipsis-v"></i>
            </div>
        </li>
    )
}

export default Contacts

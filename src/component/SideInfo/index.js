import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import userAction from '../../actions/userAction';
import groupAction from '../../actions/groupAction';
import groupStore from '../../stores/groupStore';
import { localStorage } from '../../something';
import Modal from '../Modal';

class SideInfo extends Component {
    
    constructor() {
        super();

        this.state = {
            flag: false,
            group: {},
            rooms: [],
            seft: false,
            isShow: false,
            info: { info: {} },
            isFriend: false,
            track: 0,
            showModal: false,
            inputAddingRoomName: '',
            notify: ''
        }

        this.addFriend = this.addFriend.bind(this);
        this.removeFriend = this.removeFriend.bind(this);
        this.loadRoomsInfo = this.loadRoomsInfo.bind(this);
        this.addNewRoom = this.addNewRoom.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    componentWillMount() {
        userStore.addViewInfoListener(() => {
            this.viewInfo();
        });

        userStore.addLoadUserInfoListener(() => {
            if (this.state.isShow) {
                userAction.getToView(this.state.info.id, (err, result) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                })
            }
        });

        groupStore.addViewGroupListener(() => {
            this.viewGroup();
        });

        groupStore.addLoadRoomsInfoListener(() => {
            this.loadRoomsInfo();
        })
    }

    componentWillUnmount() {
        userStore.removerViewInfoListener(() => {
            this.viewInfo();
        });

        userStore.removerLoadUserInfoListener(() => {
            if (this.state.isShow) {
                userAction.getToView(this.state.info.id, (err, result) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                })
            }
        });

        groupStore.removeViewGroupListener(() => {
            this.viewGroup();
        });

        groupStore.removeLoadRoomsInfoListener(() => {
            this.loadRoomsInfo();
        })
    }

    viewInfo() {
        if (JSON.stringify(userStore.getInfo()) === JSON.stringify({})) {
            console.log(userStore.getInfo());
            return;
        }
        this.setState({
            flag: false,
            info: userStore.getInfo(),
            isShow: true,
            isFriend: false
        });

        userStore.getInfo().friends.forEach((element, index) => {
            if (element.id === localStorage.get_Id()) {
                this.setState({
                    isFriend: true,
                    track: element.track
                })
            }
        });
    }

    viewGroup() {
        this.setState({
            flag: true,
            isShow: true,
            group: groupStore.getInfo()
        });
    }

    loadRoomsInfo() {
        this.setState({
            rooms: groupStore.getRooms()
        })
    }

    addFriend() {
        userAction.addFriend(this.state.info.id, (err, result) => {
            if (err) return console.log(err);
        });
    }

    removeFriend() {
        userAction.removeFriend(this.state.info.id, (err, result) => {
            if (err) return console.log(err);
        });
    }

    addNewRoom() {
        if (this.state.inputAddingRoomName === '') {
            return this.setState({
                notify: "room's name must not blank"
            })
        }
        let payload = {
            groupId: this.state.group._id,
            roomName: this.state.inputAddingRoomName
        }
        groupAction.addNewRoom(payload, (err, result) => {
            if (err) return console.log(err);
            this.setState({
                notify: 'successing add new room'
            })
        })
    }

    updateInput(event) {
        this.setState({
            inputAddingRoomName: event.target.value
        });
    }

    render() {
        if (this.state.flag) {
            const listRooms = this.state.rooms.map((item, index) => {
                return (
                    <li key={index}>
                        <div>room: {item.name}</div>
                    </li>
                )
            })
            return (
                <div className={this.state.isShow ? "sideInfo" : "hide"}>
                    <div onClick={() => {this.setState({ isShow: false })}}>close</div>
                    <div>
                        {localStorage.get_Id() + '' === this.state.group.admin + '' ? 'Disband' : 'Leave'}
                    </div>
                    <div>name: {this.state.group.name}</div>
                    <div>desc: {this.state.group.description}</div>
                    <Modal 
                        isOpen={this.state.showModal}
                        title='Add new room'
                    >
                        <div>
                            <input 
                                placeholder="Room's name ..."
                                type='text'
                                value={this.state.inputAddingRoomName}
                                onChange={this.updateInput}
                            />
                        </div>
                        <div onClick={this.addNewRoom}>
                            add room
                        </div>
                        <div onClick={() => {this.setState({ showModal: false })}}>cancel</div>
                        <div>{this.state.notify}</div>
                    </Modal>
                    <div onClick={() => {this.setState({ showModal: true, inputAddingRoomName: '', notify: '' })}}>
                        add new room
                    </div>
                    <ul>
                        {listRooms}
                    </ul>
                </div>
            )
        } else {
            return (
                <div className={this.state.isShow ? "sideInfo" : "hide"}>
                    <div onClick={() => {this.setState({ isShow: false })}}>close</div>
                    <div className="side-ava"><img src="/static/media/default_ava.cf22e533.jpg" alt=""/></div>
                    <div className="sideInfo-content">
                        <div>Name: {this.state.info.info.name || ''}</div>
                        <div>Addr: {this.state.info.info.addr || ''}</div>
                        <div>Birth Day: {this.state.info.info.birth || ''}</div>
                        <div>Email: {this.state.info.info.email || ''}</div>
                        <div>Facebook: {this.state.info.info.fb || ''}</div>
                    </div>
                    <Option
                        addAction={this.addFriend}
                        removeAction={this.removeFriend}
                        acceptAction={() => {
                            console.log('accept');
                        }}
                        track={this.state.track}
                        isFriend={this.state.isFriend}
                    />
                    
                </div>
            )
        }
    }
}

const Option = ({ addAction, removeAction, acceptAction, track, isFriend }) => {
    return (
        <div className="option">
            <div onClick={isFriend ? removeAction : addAction}>
                {!isFriend ? "add friend" : "remove friend"}
            </div>
            <div onClick={track === -2 ? () => {console.log('object')} : acceptAction}>
                {track === -2 ? 'some' : 'accept'}
            </div>
            <div>block</div>
            <div>report</div>
        </div>
    )
    
}

export default SideInfo;
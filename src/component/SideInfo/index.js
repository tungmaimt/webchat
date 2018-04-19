import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import userAction from '../../actions/userAction';
import groupAction from '../../actions/groupAction';
import groupStore from '../../stores/groupStore';
import messageAction from '../../actions/messageAction';
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
            notify: '',
        }

        this.addFriend = this.addFriend.bind(this);
        this.removeFriend = this.removeFriend.bind(this);
        this.loadRoomsInfo = this.loadRoomsInfo.bind(this);
        this.addNewRoom = this.addNewRoom.bind(this);
        this.loadUsersInfoInGroup = this.loadUsersInfoInGroup.bind(this);
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
        });

        groupStore.addLoadUsersInfoInGroupListener(() => {
            this.loadUsersInfoInGroup();
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
        });

        groupStore.removeLoadUsersInfoInGroupListener(() => {
            this.loadUsersInfoInGroup();
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

    loadUsersInfoInGroup() {
        let num = 0;
        let rooms = this.state.rooms;
        let usersInfoInGroup = groupStore.getUsersInfoInGroup();

        rooms.forEach((element, index) => {
            let count = 0;
            element.members.forEach((element2, index2) => {
                usersInfoInGroup.forEach((element3, index3) => {
                    if (element3.id === element2.id) {
                        element2.name = element3.info.name;
                        count++;
                        if (count === element.members.length) num++;
                        if (num === rooms.length) {
                            this.setState({ rooms: rooms });
                        }
                    }
                });
            });
        });
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

    goRoom(room, roomIndex) {
        let payload = {
            room: room._id
        }
        messageAction.changeChatObj(room);
        messageAction.getMessage(payload, (response) => {
            if (response.res !== 'ok') {
                console.log(response);
            }
        });
        this.state.rooms.forEach((element, index) => {
            if (index !== roomIndex) this.refs['room' + index].className = 'hide';
            else this.refs['room' + roomIndex].className = 'roomInfo';
        })
        console.log(room);
    }

    updateInput(event) {
        this.setState({
            inputAddingRoomName: event.target.value
        });
    }

    render() {
        
        if (this.state.flag) {
            const roomMembers = (list) => {
                return list.map((item, index) => {
                    return (
                        <li key={index}>
                            {item.name}
                        </li>
                    )
                })
            }
            const listRooms = this.state.rooms.map((item, index) => {
                const mem = roomMembers(item.members);
                return (
                    <li key={index} onClick={() => {this.goRoom(item, index)}} className="room">
                        <div className="room-name"># {item.name}</div>
                        <ul className="hide" ref={"room" + index}>
                            {mem}
                        </ul>
                    </li>
                )
            })
            console.log(this.state.group);
            return (
                <div className={this.state.isShow ? "sideInfo" : "hide"}>
                    <div className="group-name">{this.state.group.name}</div>
                    <div className="group-desc"><i>desc: {this.state.group.description}</i></div>
                    <div className="group-code"><span className="text-code">join code:</span> {this.state.group.join_code}</div>
                    <div className="group-opt">
                        <div onClick={() => {this.setState({ isShow: false })}} className="opt-item">
                            close
                        </div>
                        <div className="opt-item">
                            {localStorage.get_Id() + '' === this.state.group.admin + '' ? 'Disband' : 'Leave'}
                        </div>
                    </div>
                    
                    <Modal 
                        isOpen={this.state.showModal}
                        title='Add new room'
                        className="modal"
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
                    <div 
                        onClick={() => {this.setState({ showModal: true, inputAddingRoomName: '', notify: '' })}}
                        className="btn"
                    >
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
                    <div className="side-ava"><img src={"http://localhost:3000/" + (this.state.info.info.ava || 'default_ava.jpg')} alt="ava"/></div>
                    <div className="sideInfo-content">
                        <div>{this.state.info.info.name}</div>
                        {/* <div>Name: {this.state.info.info.name || ''}</div>
                        <div>Addr: {this.state.info.info.addr || ''}</div>
                        <div>Birth Day: {this.state.info.info.birth || ''}</div>
                        <div>Email: {this.state.info.info.email || ''}</div>
                        <div>Facebook: {this.state.info.info.fb || ''}</div> */}
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
                    <div onClick={() => {this.setState({ isShow: false })}}>close</div>
                </div>
            )
        }
    }
}

const Option = ({ addAction, removeAction, acceptAction, track, isFriend }) => {
    return (
        <div className="option">
            <div onClick={isFriend ? removeAction : addAction} className="btn-opt">
                {!isFriend ? "add friend" : "remove friend"}
            </div>
            <div 
                onClick={track === -2 ? () => {console.log('object')} : acceptAction} 
                className={track === -2 ? "btn-opt-static" : "btn-opt"}
            
            >
                {track === -2 ? 'wait for answer' : 'accept'}
            </div>
            <div className="btn-opt">block</div>
            <div className="btn-opt">report</div>
        </div>
    )
    
}

export default SideInfo;
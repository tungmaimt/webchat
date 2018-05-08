import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import userAction from '../../actions/userAction';
import groupAction from '../../actions/groupAction';
import groupStore from '../../stores/groupStore';
import messageAction from '../../actions/messageAction';
import { localStorage } from '../../something';
import { registerHandleResponse, removeHandleResponse } from '../../something';
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
            selectRoom: '',
        }

        this.addFriend = this.addFriend.bind(this);
        this.answerFriend = this.answerFriend.bind(this);
        this.removeFriend = this.removeFriend.bind(this);
        this.loadRoomsInfo = this.loadRoomsInfo.bind(this);
        this.addNewRoom = this.addNewRoom.bind(this);
        this.loadGroupInfo = this.loadGroupInfo.bind(this);
        this.loadUsersInfoInGroup = this.loadUsersInfoInGroup.bind(this);
        this.reCode = this.reCode.bind(this);
        this.disbandGroup = this.disbandGroup.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);
        this.updateInput = this.updateInput.bind(this);
        this.handleJoinRoomResponse = this.handleJoinRoomResponse.bind(this);
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

        groupStore.addLoadGroupsInfoListener(() => {
            this.loadGroupInfo();
        })

        groupStore.addViewGroupListener(() => {
            this.viewGroup();
        });

        groupStore.addLoadRoomsInfoListener(() => {
            this.loadRoomsInfo();
        });

        groupStore.addLoadUsersInfoInGroupListener(() => {
            this.loadUsersInfoInGroup();
        });

        registerHandleResponse('joinRoomInfo', this.handleJoinRoomResponse);
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

        groupStore.removeLoadGroupsInfoListener(() => {
            this.loadGroupInfo();
        })

        groupStore.removeViewGroupListener(() => {
            this.viewGroup();
        });

        groupStore.removeLoadRoomsInfoListener(() => {
            this.loadRoomsInfo();
        });

        groupStore.removeLoadUsersInfoInGroupListener(() => {
            this.loadUsersInfoInGroup();
        });

        removeHandleResponse('joinRoomInfo', this.handleJoinRoomResponse);
    }

    loadGroupInfo() {
        groupStore.getGroups().forEach((element, index) => {
            if (element._id + '' === this.state.group._id + '') {
                this.setState({
                    group: element
                })
            }
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

    handleJoinRoomResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('something wrong');
        }
        let rooms = this.state.rooms;
        let count = 0;

        rooms.forEach((element, index) => {
            if (element._id + '' === result.result._id + '') {
                element.members = result.result.members;
                console.log(element);
                this.setState({
                    rooms: rooms
                })
            }
            count++;
            if (count === rooms.length) {
                this.loadUsersInfoInGroup();
            }
        })
    }

    addFriend() {
        userAction.addFriend(this.state.info.id, (err, result) => {
            if (err) return console.log(err);
        });
    }

    answerFriend() {
        userAction.answerFriend(this.state.info.id, (err, result) => {
            if (err) return console.log(err);
        })
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
        let check = false;
        let count = 0;
        room.members.forEach((element, index) => {
            if (element.id + '' === localStorage.get_Id() + '') {
                check = true;
            }
            count++;
            
            if (count === room.members.length) {
                if (!check) {
                    console.log('ohhhh');
                    groupAction.joinRoom({ roomId: room._id }, (err, response) => {
                        if (err) return console.log(err);
                        return console.log(response);
                    })
                }
            }
        });
        this.setState({
            selectRoom: room._id
        })
        console.log(room);
    }

    reCode() {
        let payload = {
            groupId: this.state.group._id,
            oldCode: this.state.group.join_code
        }
        groupAction.reCode(payload, (err, response) => {
            if (err) return console.log(err);
            if (response) console.log(response);
        })
    }

    disbandGroup() {
        let payload = {
            groupId: this.state.group._id,
        }
        groupAction.disbandGroup(payload, (err, response) => {
            if (err) return console.log(err);
            console.log(response);
        });
        this.setState({
            isShow: false
        })
    }

    leaveGroup() {
        let payload = {
            groupId: this.state.group._id,
        }
        groupAction.leaveGroup(payload, (err, response) => {
            if (err) return console.log(err);
            console.log(response);
        });
        this.setState({
            isShow: false
        })
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
                console.log(item);
                const mem = roomMembers(item.members);
                return (
                    <li key={index} onClick={() => {this.goRoom(item, index)}} className="room">
                        <div className="room-name"># {item.name}</div>
                        <ul 
                            className={item._id === this.state.selectRoom ? "roomInfo" : "hide"} 
                            ref={"room" + index}
                        >
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
                    <div className="group-code">
                        <div className="group-text">
                            <span className="text-code">join code:</span> {this.state.group.join_code}
                        </div>
                        <div className='reCode' onClick={this.reCode}>
                            <i className="fas fa-redo-alt"></i>
                        </div>
                    </div>
                    <div className="group-opt">
                        <div onClick={() => {this.setState({ isShow: false })}} className="opt-item">
                            close
                        </div>
                        <div 
                            className="opt-item" 
                            onClick={localStorage.get_Id() + '' === this.state.group.admin + '' ? 
                            this.disbandGroup : 
                            this.leaveGroup}
                        >
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
                        acceptAction={this.answerFriend}
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
                className={!isFriend ? "hide" : track === -2 ? "btn-opt-static" : track === 0 ? "hide" : "btn-opt"}
            
            >
                {track === -2 ? 'wait for answer' : 'accept'}
            </div>
            <div className="btn-opt">block</div>
            <div className="btn-opt">report</div>
        </div>
    )
    
}

export default SideInfo;
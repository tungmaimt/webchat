import React, { Component } from 'react';
import './style.css';
import groupAction from '../../actions/groupAction';
import groupStore from '../../stores/groupStore';
import { registerHandleResponse, removeHandleResponse } from '../../something';

class Groups extends Component {

    constructor() {
        super();

        this.state = {
            groups: []
        }
    }

    componentWillMount() {
        groupStore.addLoadGroupsInfoListener(() => {
            this.setState({
                groups: groupStore.getGroups()
            })
        })

        registerHandleResponse('loadGroupsInfo', this.handleLoadGroupInfoResponse);
        registerHandleResponse('loadRoomsInfo', this.handleLoadRoomsInfoResponse);
        registerHandleResponse('loadUsersInfoInGroup', this.handleLoadUsersInfoInGroup);
    }

    componentWillUnmount() {
        groupStore.removeLoadGroupsInfoListener(() => {
            this.setState({
                groups: groupStore.getGroups()
            })
        })

        removeHandleResponse('loadGroupsInfo', this.handleLoadGroupInfoResponse);
        removeHandleResponse('loadRoomsInfo', this.handleLoadRoomsInfoResponse);
        removeHandleResponse('loadUsersInfoInGroup', this.handleLoadUsersInfoInGroup);
    }

    handleLoadGroupInfoResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('something worng');
        }
        groupAction.loadGroupsInfo(result.result);
    }

    handleLoadRoomsInfoResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('something worng');
        }
        groupAction.loadRoomsInfo(result.result);
    }

    handleLoadUsersInfoInGroup(result) {
        if (!result.success) {
            console.log(result);
            return console.log('something worng');
        }
        groupAction.loadUsersInfoInGroup(result.result);
    }

    viewGroup(ma) {
        this.state.groups.forEach((element, index) => {
            if (element._id + '' === ma) {
                groupAction.getRoomsInfo(ma, (err, result) => {
                    if (err) return console.log(err);
                });
                groupAction.viewGroup(element);
            }
        })
    }

    render() {
        const listGroups = this.state.groups.map((item, index) => {
            return (
                <Group 
                    id={index}
                    ma={item._id}
                    key={index}
                    groupName={item.name}
                    groupDescription={item.description}
                    onClick={(ma) => {this.viewGroup(ma)}}
                />
            )
        })
        return (
            <ul>
                {listGroups}
            </ul>
        );
    }
}

const Group = ({ id, ma, groupName, onClick, online, viewInfo, groupDescription }) => {
    return (
        <li className="group-item" ma={ma} >
            <div className="group-view" onClick={() => {onClick(ma, id)}}>
                <img className="ava" src="/static/media/default_ava.cf22e533.jpg" alt="ava"/>
                <div className="group-content">
                    <div className="groupName">{groupName}</div>
                    <div className="group-message">
                        {groupDescription}
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
    );
}

export default Groups;
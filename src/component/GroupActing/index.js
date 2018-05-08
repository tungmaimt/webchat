import React, { Component } from 'react';
import './style.css';
import groupAction from '../../actions/groupAction';
import Modal from '../Modal';
import { registerHandleResponse, removeHandleResponse } from '../../something';

class GroupActing extends Component {

    constructor() {
        super();

        this.state = {
            inputGroupName: '',
            inputGroupDescription: '',
            inputJoinCode: '',
            showModalCreateGroup: false,
            showModalJoinGroup: false,
            notify: ' ',
        }

        this.updateInput = this.updateInput.bind(this);
        this.updateInputJoinCode = this.updateInputJoinCode.bind(this);
        this.openModalCreateGroup = this.openModalCreateGroup.bind(this);
        this.openModalJoinGroup = this.openModalJoinGroup.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.joinGroup = this.joinGroup.bind(this);
        this.handleJoinGroupResponse = this.handleJoinGroupResponse.bind(this);
    }

    componentWillMount() {
        registerHandleResponse('joinGroupResult', this.handleJoinGroupResponse);
    }

    componentWillUnmount() {
        removeHandleResponse('joinGroupResult', this.handleJoinGroupResponse);
    }

    updateInput(key, event) {
        if (key) {
            this.setState({
                inputGroupName: event.target.value
            })
        } else {
            this.setState({
                inputGroupDescription: event.target.value
            })
        }
    }

    updateInputJoinCode(input, event) {
        this.setState({
            inputJoinCode: event.target.value
        });
    }

    openModalCreateGroup() {
        this.setState({
            showModalCreateGroup: true
        })
    }

    openModalJoinGroup() {
        this.setState({
            showModalJoinGroup: true
        })
    }

    handleJoinGroupResponse(result) {
        this.setState({
            notify: result.result
        })
    }

    createGroup() {
        if (this.state.inputGroupName === '' || this.state.inputGroupDescription === '') {
            this.setState({
                notify: 'group name or description must not blank'
            });
        } else {
            let payload = {
                groupName: this.state.inputGroupName,
                groupDescription: this.state.inputGroupDescription
            }
            groupAction.createGroup(payload, (err, result) => {
                if (err) return console.log(err);
                this.setState({
                    notify: 'successing create new group'
                })
            });
        }
    }

    joinGroup() {
        if (this.state.inputJoinCode === '') {
            this.setState({
                notify: 'join code is blank'
            });
        } else {
            let payload = {
                joinCode: this.state.inputJoinCode
            }
            groupAction.joinGroup(payload, (err, result) => {
                if (err) return console.log(err);
                console.log(result);
            })
        }
    }

    render() {
        return (
            <div className="group-act">
                <div onClick={this.openModalCreateGroup} className="btn">create group</div>
                <div onClick={this.openModalJoinGroup} className="btn">join group</div>
                <Modal isOpen={this.state.showModalCreateGroup} title="create new group">
                    <div>Group name
                        <input
                            value={this.state.inputGroupName}
                            onChange={(event) => {this.updateInput(true, event)}}
                        />
                    </div>
                    <div>Description
                        <input
                            value={this.state.inputGroupDescription}
                            onChange={(event) => {this.updateInput(false, event)}}
                        /> 
                    </div>
                    <div onClick={this.createGroup}>create</div>
                    <div onClick={() => {this.setState({showModalCreateGroup: false, inputGroupName: '', inputGroupDescription: '', notify: ' '})}}>cancel</div>
                    <div>{this.state.notify}</div>
                </Modal>
                <Modal isOpen={this.state.showModalJoinGroup} title="join a group">
                    <div>join code
                        <input
                            value={this.state.inputJoinCode}
                            onChange={(event) => {this.updateInputJoinCode(true, event)}}
                        />
                    </div>
                    <div onClick={this.joinGroup}>join</div>
                    <div onClick={() => {this.setState({showModalJoinGroup: false, inputJoinCode: '', notify: ''})}}>cancel</div>
                    <div>{this.state.notify}</div>
                </Modal>
            </div>
        );
    }
}

export default GroupActing;
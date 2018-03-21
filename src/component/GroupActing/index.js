import React, { Component } from 'react';
import './style.css';
import groupAction from '../../actions/groupAction';
import Modal from '../Modal';

class GroupActing extends Component {

    constructor() {
        super();

        this.state = {
            inputGroupName: '',
            inputGroupDescription: '',
            showModal: false,
            notify: ' ',
        }

        this.updateInput = this.updateInput.bind(this);
        this.openModal = this.openModal.bind(this);
        this.createGroup = this.createGroup.bind(this);
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

    openModal() {
        this.setState({
            showModal: true
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

    render() {
        return (
            <div>
                <div onClick={this.openModal}>create group</div>
                <Modal isOpen={this.state.showModal} title="create new group">
                    <div>Group name
                        <input
                            value={this.state.inputGroupNameKey}
                            onChange={(event) => {this.updateInput(true, event)}}
                        />
                    </div>
                    <div>Description
                        <input
                            value={this.state.searchingKey}
                            onChange={(event) => {this.updateInput(false, event)}}
                        /> 
                    </div>
                    <div onClick={this.createGroup}>create</div>
                    <div onClick={() => {this.setState({showModal: false, notify: ' '})}}>cancel</div>
                    <div>{this.state.notify}</div>
                </Modal>
            </div>
        );
    }
}

export default GroupActing;
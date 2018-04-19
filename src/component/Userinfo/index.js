import React, { Component } from 'react';
import './style.css';
import userStore from '../../stores/userStore';
import Modal from '../Modal';
import userAction from '../../actions/userAction';


class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: [1, 2, 3],
            statusDes: '',
            userInfo: {},
            showModal: false,
            inputName: '',
            inputBirth: '',
            inputCountries: '',
            inputEmail: ''
        }

        this.viewInfo = this.viewInfo.bind(this);
        this.changeInputAva = this.changeInputAva.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    componentWillMount() {
        userStore.addLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo().info,
                inputName: userStore.getUserInfo().info.name,
                inputBirth: userStore.getUserInfo().info.birth,
                inputEmail: userStore.getUserInfo().info.email,
                inputCountries: userStore.getUserInfo().info.addr,
            })
        })
    }

    componentWillUnmount() {
        userStore.removerLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo().info,
                inputName: userStore.getUserInfo().info.name,
                inputBirth: userStore.getUserInfo().info.birth,
                inputEmail: userStore.getUserInfo().info.email,
                inputCountries: userStore.getUserInfo().info.addr
            });
        })
    }

    viewInfo() {
        let avaView = 'http://localhost:3000/' + (this.state.userInfo.ava === '' ? 'default_ava.jpg' : this.state.userInfo.ava) ;
        this.refs.avaBox.style.backgroundImage = 'url("' + avaView + '")';
        this.setState({
            showModal: true
        })
    }

    changeInputAva() {
        const fileInput = this.refs.inputAva;
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader()
            reader.onload = e => {
                this.refs.avaBox.style.backgroundImage = 'url("' + e.target.result + '")';
            }
            reader.readAsDataURL(fileInput.files[0])
        }
    }

    updateInput(event) {
        switch (event.target.name) {
            case 'name':
                this.setState({ inputName: event.target.value });
            break;
            case 'birth':
                this.setState({ inputBirth: event.target.value });
            break;
            case 'email':
                this.setState({ inputEmail: event.target.value });
            break;
            case 'countries':
                this.setState({ inputCountries: event.target.value });
            break;
            default:
        }
    }

    updateUserInfo() {
        const formData = new FormData();
        const info = {};
        info.name = this.state.inputName;
        info.birth = this.state.inputBirth;
        info.ava = this.refs.inputAva.files && this.refs.inputAva.files[0] ? '' : this.state.userInfo.ava;
        info.email = this.state.inputEmail;
        info.addr = this.state.inputCountries;
        formData.append('info', JSON.stringify(info));
        if (this.refs.inputAva.files && this.refs.inputAva.files[0]) {
            formData.append('file', this.refs.inputAva.files[0]);
        }
        
        userAction.updateInfo(formData, (err, result) => {
            if (err) return console.log(err);
            console.log(result);
        })
    }

    render() {
        return (
            <div className="userinfo">
                <div className="r-1">
                    <div className="user-content" onClick={this.viewInfo}>
                        <img 
                            className="ava" 
                            alt="ava"
                            src={'http://localhost:3000/' + (this.state.userInfo.ava || 'default_ava.jpg')}
                        />
                        <div className="username">{this.state.userInfo.name}</div>
                    </div>
                    <div className="dot active">
                        <i className="fas fa-circle"></i>
                    </div>
                </div>
                <div className="status">status here</div>
                <Modal title="Your infomation" isOpen={this.state.showModal}>
                    <div className="modal-userinfo">
                        <div className="ava-box" ref="avaBox">
                            <div className="overlay">
                                <label htmlFor="inputFile">
                                    <i className="fa fa-edit"></i>
                                </label>
                                <input 
                                    id="inputFile" 
                                    ref="inputAva" 
                                    onChange={this.changeInputAva} 
                                    type="file" 
                                    name="avatar" 
                                />
                            </div>
                        </div>
                        <div className="some-info">
                            <div>Name: <input value={this.state.inputName} name="name" onChange={this.updateInput} /></div>
                            <div>Brith day: <input value={this.state.inputBirth} name="birth" onChange={this.updateInput} /></div>
                            <div>Email: <input value={this.state.inputEmail} name="email" onChange={this.updateInput} /></div>
                            <div>Countries: <input value={this.state.inputCountries} name="countries" onChange={this.updateInput} /></div>
                        </div>
                    </div>
                    <div className="modal-userinfo" onClick={this.updateUserInfo}>update</div>
                    <div 
                        className="modal-userinfo" 
                        onClick={() => {this.setState({ 
                            showModal: false,
                            inputName: userStore.getUserInfo().info.name,
                            inputBirth: userStore.getUserInfo().info.birth,
                            inputEmail: userStore.getUserInfo().info.email,
                            inputCountries: userStore.getUserInfo().info.addr })}}
                    >
                        close
                    </div>
                </Modal>
            </div>
        );
    }
}

export default UserInfo;

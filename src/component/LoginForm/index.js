import React, { Component } from 'react';
import './style.css';
import loginAction from '../../actions/loginAction';
import userAction from '../../actions/userAction';
import { registerHandleResponse, removeHandleResponse, localStorage } from '../../something';
import Modal from '../Modal';

class LoginForm extends Component {
    constructor() {
        super();

        this.state = {
            username: '',
            password: '',
            notifyMess: ''
        };

        this.updateInput = this.updateInput.bind(this);
        this.login = this.login.bind(this);
        this.notify = this.notify.bind(this);
    }

    updateInput(event) {
        let field = event.target.name;
        this.setState({
            [field]: event.target.value
        });
    }

    componentDidMount() {
        registerHandleResponse('userLogin', (result) => {
            console.log(result);
            if (result.success) {
                loginAction.changeLoginState(true);
                localStorage.save(result.token, result._id);
                userAction.getInfo(localStorage.get_Id(), (err, response) => {
                    if (err) {
                        if (err.name === 'JsonWebTokenError')
                            console.log('JsonWebTokenError');
                    }
                })
            } else {
                this.notify('username or password are incorrect');
            }
        });
    }

    componentWillUnmount() {
        removeHandleResponse('userLogin', (result) => {
            console.log(result);
            if (result.success) {
                loginAction.changeLoginState(true);
                localStorage.save(result.token, result._id);
            } else {
                this.notify('username or password are incorrect');
            }
        });
    }

    notify(message) {
        this.setState({
            notifyMess: message
        });
    }

    login(event) {
        event.preventDefault();
        if (this.state.username === '' || this.state.password === '')
            return this.notify('username or password can not blank');
        let payload = {
            username: this.state.username,
            password: this.state.password
        }
        loginAction.login(payload, (err, response) => {
            if (err) return console.log(err);
            console.log(response);
        });
    }

    goSignUp(event) {
        event.preventDefault();
        loginAction.changeSignUpState(true);
    }

    render() {
        return (
            <div className="loginForm">
            <Modal isOpen='true' title="Login">
                <input name='username' onChange={this.updateInput} value={this.state.username} placeholder="Input username ..."></input>
                <input name='password' onChange={this.updateInput} value={this.state.password} type="password" placeholder="Input password ..."></input>
                <button className="primary" type='button' onClick={this.login}>Login</button>
                <button className="danger" type='button' onClick={this.goSignUp}>Go to sign up</button>
                <div>{this.state.notifyMess}</div>
            </Modal>
                {/* <p>Login</p>
                <input name='username' onChange={this.updateInput} value={this.state.username} type='text'></input>
                <br/>
                <input name='password' onChange={this.updateInput} value={this.state.password} type='password'></input>
                <br/>
                <button type='button' onClick={this.login}>Login</button>
                <button type='button' onClick={this.goSignUp}>Go to sign up</button>
                <br/>
                <div>{this.state.notifyMess}</div> */}
            </div>
        )
    }
}

export default LoginForm;

import React, { Component } from 'react';
import './style.css';
import loginAction from '../../actions/loginAction';
import { registerHandleResponse } from '../../something';

const localStorage = window.localStorage;

class LoginForm extends Component {
    constructor() {
        super();

        this.state = {
            username: 'caigi',
            password: 'caigi',
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
                localStorage.wcToken = result.token;
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
        loginAction.login(payload);
    }

    goSignUp(event) {
        event.preventDefault();
        loginAction.changeSignUpState(true);
    }

    render() {
        return (
            <div className="loginForm">
                <p>Login</p>
                <input name='username' onChange={this.updateInput} value={this.state.username} type='text'></input>
                <br/>
                <input name='password' onChange={this.updateInput} value={this.state.password} type='password'></input>
                <br/>
                <button type='button' onClick={this.login}>Login</button>
                <button type='button' onClick={this.goSignUp}>Go to sign up</button>
                <br/>
                <div>{this.state.notifyMess}</div>
            </div>
        )
    }
}

export default LoginForm;
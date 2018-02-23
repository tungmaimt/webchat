import React, { Component } from 'react';
import './style.css';
import { registerHandleResponse } from '../../something';
import loginAction from '../../actions/loginAction';

class SignUpForm extends Component {
    constructor() {
        super();

        this.state = {
            username: 'caigi',
            password: 'caigi',
            re_password: 'caigi',
            notifyMess: ''
        };

        this.updateInput = this.updateInput.bind(this);
        this.signUp = this.signUp.bind(this);
        this.notify = this.notify.bind(this);
    }

    componentDidMount() {
        registerHandleResponse('userSignUp', (result) => {
            this.notify(result.result);
            console.log(result);
        });
    }

    updateInput(event) {
        let field = event.target.name;
        this.setState({
            [field]: event.target.value
        });
    }

    signUp(event) {
        event.preventDefault();
        if (this.state.username === '' || this.state.password === '' || this.state.re_password === '')
            this.notify('you must fill all the field');
        else if (this.state.password !== this.state.re_password)
            this.notify('password and re-password not match!');
        else {
            this.notify('');
            let payload = {
                username: this.state.username,
                password: this.state.password
            }
            loginAction.signUp(payload);
        }
    }

    notify(message) {
        this.setState({
            notifyMess: message
        });
    }

    toLogin(event) {
        event.preventDefault();
        loginAction.changeSignUpState(false);
    }

    render() {
        return (
            <div className="signUpForm">
                <p>Sign Up</p>
                <input name='username' onChange={this.updateInput} value={this.state.username} type='text'></input>
                <br/>
                <input name='password' onChange={this.updateInput} value={this.state.password} type='password'></input>
                <br />
                <input name='re_password' onChange={this.updateInput} value={this.state.re_password} type='password'></input>
                <br/>
                <button type='button' onClick={this.signUp}>Sign up</button>
                <button type='button' onClick={this.toLogin}>Go go login</button>
                <br/>
                <div>{this.state.notifyMess}</div>
            </div>
        )
    }
}

export default SignUpForm;
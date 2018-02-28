import React, { Component } from 'react';
import './style.css';
import LoginForm from '../LoginForm';
import SignUpForm from '../SignUpForm';
import loginStore from '../../stores/loginStore';

class LoginModal extends Component {
    constructor() {
        super();

        this.state = {
            isShow: !this.checkLogin(),
            isSignUp: false
        }
        this.toggleModal = this.toggleModal.bind(this);
    }

    checkLogin() {
        if (!window.localStorage.wcToken) return false;
        else return true;
    }

    toggleModal() {
        this.setState({
            isShow: !this.state.isShow
        });
    }

    componentWillMount() {
        loginStore.addChangeLoginStateListener(() => {
            this.setState({
                isShow: !loginStore.getLoginState()
            });
        });
        loginStore.addChangeSignUpStateListener(() => {
            this.setState({
                isSignUp: loginStore.getSignUpState()
            });
        })
    }

    componentWillUnmount() {
        loginStore.removeChangeLoginStateListener(() => {
            this.setState({
                isShow: !loginStore.getLoginState()
            })
        });
        loginStore.removeChangeSignUpStateListener(() => {
            this.setState({
                isSignUp: loginStore.getSignUpState()
            })
        })
    }

    render() {
        if (this.state.isSignUp) 
            return (
                <div className={this.state.isShow ? 'show loginModal' : 'hide loginModal'}>
                    <SignUpForm />
                </div>
            );
        else
            return (
                <div className={this.state.isShow ? 'show loginModal' : 'hide loginModal'}>
                    <LoginForm />
                </div>
            );  
    }
}

export default LoginModal;
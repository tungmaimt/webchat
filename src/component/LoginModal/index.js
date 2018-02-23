import React, { Component } from 'react';
import './style.css';
import LoginForm from '../LoginForm';
import SignUpForm from '../SignUpForm';
import userStore from '../../stores/loginStore';

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
        if (window.localStorage.wcToken) return true;
        else return false;
    }

    toggleModal() {
        this.setState({
            isShow: !this.state.isShow
        });
    }

    componentWillMount() {
        userStore.addChangeLoginStateListener(() => {
            this.setState({
                isShow: !userStore.getLoginState()
            });
        });
        userStore.addChangeSignUpStateListener(() => {
            this.setState({
                isSignUp: userStore.getSignUpState()
            })
        })
    }

    componentWillUnmount() {
        userStore.removeChangeLoginStateListener(() => {
            this.setState({
                isShow: !userStore.getLoginState()
            })
        });
        userStore.removeChangeSignUpStateListener(() => {
            this.setState({
                isSignUp: userStore.getSignUpState()
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
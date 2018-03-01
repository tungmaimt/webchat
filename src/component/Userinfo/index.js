import React, { Component } from 'react';
import './style.css';
import ava from '../../static/images/default_ava.jpg';
import userStore from '../../stores/userStore';


class Userinfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: [1, 2, 3],
            statusDes: '',
            userInfo: {},
        }
    }

    componentWillMount() {
        userStore.addLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo().info
            })
        })
    }

    componentWillUnmount() {
        userStore.removerLoadUserInfoListener(() => {
            this.setState({
                userInfo: userStore.getUserInfo().info
            })
        })
    }

    render() {
        return (
            <div className="userinfo">
                <div className="r-1">
                    <img className="ava" src={ava} alt="ava"/>
                    <div className="username">{this.state.userInfo.name}</div>
                    <div className="dot active">
                        <i className="fas fa-circle"></i>
                    </div>
                </div>
                <div className="status">status here</div>
            </div>
        );
    }
}

export default Userinfo;

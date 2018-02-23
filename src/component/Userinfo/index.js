import React, { Component } from 'react';
import './style.css';
import ava from '../../static/images/default_ava.jpg';


class Userinfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: [1, 2, 3],
            statusDes: '',
        }
    }

    render() {
        return (
            <div className="userinfo">
                <img className="ava" src={ava} alt="ava"/>
                <div className="username">name here</div>
                <div>status here</div>
            </div>
        );
    }
}

export default Userinfo;
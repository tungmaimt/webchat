import React, { Component } from 'react';
import './style.css';
import Userinfo from '../Userinfo';
import Contacts from '../Contacts';

class Asidebar extends Component {

    render() {
        return (
            <div className="asidebar">
                <Userinfo />
                <Contacts />
            </div>
        );
    }
}

export default Asidebar;
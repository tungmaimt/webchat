import React, { Component } from 'react';
import './style.css';

class SideInfo extends Component {
    
    constructor() {
        super();

        this.state = {
            seft: false,
            isShow: false
        }
    }

    render() {
        return (
            <div className="sideInfo">
                <div className="side-ava"><img src="/static/media/default_ava.cf22e533.jpg" alt=""/></div>
                <div className="sideInfo-content">
                    <div>Name: </div>
                    <div>Addr: </div>
                    <div>Birth Day:</div>
                    <div>Email: </div>
                    <div>Facebook: </div>
                </div>
            </div>
        )
    }
}

export default SideInfo;
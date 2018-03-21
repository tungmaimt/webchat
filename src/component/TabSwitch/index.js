import React, { Component } from 'react';
import './style.css';
import Contacts from '../Contacts';
import Searchbar from '../Searchbar';
import Groups from '../Groups';
import GroupActing from '../GroupActing';

class TabSwitch extends Component {

    constructor() {
        super();

        this.state = {
            show: 0
        }

        this.changeTab = this.changeTab.bind(this);
    }

    changeTab(id) {
        this.setState({
            show: id
        })
    }

    render() {
        return (
            <div className="tabSwitch">
                <div className="tab">
                    <div onClick={() => {this.changeTab(0)}}>
                        Contacts
                    </div>
                    <div onClick={() => {this.changeTab(1)}}>
                        Groups
                    </div>
                </div>
                <div className={this.state.show === 0 ? 'active' : 'hide'}>
                    <Searchbar flag={true}/>
                    <Contacts />
                </div>
                <div className={this.state.show === 1 ? 'active' : 'hide'}>
                    <Searchbar flag={false} />
                    <GroupActing />
                    <Groups />
                </div>
            </div>
        )
    }
}

export default TabSwitch;
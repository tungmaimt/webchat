import React, { Component } from 'react';
import './style.css';
import Userinfo from '../Userinfo';
import Contacts from '../Contacts';

class Asidebar extends Component {
    constructor() {
        super();

        this.state = {
            searchingKey: ''
        }
        this.updateInput = this.updateInput.bind(this);
    }

    searchSomeThing(event) {
        console.log(event.charCode);
    }

    updateInput(event) {
        this.setState({
            searchingKey: event.target.value
        })
    }

    render() {
        return (
            <div className="asidebar">
                <Userinfo />
                <input 
                    type='text' 
                    name='searchbar' 
                    className='searchbar' 
                    value={this.state.searchingKey} 
                    onChange={this.updateInput} 
                    onKeyPress={this.searchSomeThing}/>
                <Contacts />
            </div>
        );
    }
}

export default Asidebar;
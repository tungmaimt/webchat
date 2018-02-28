import React, { Component } from 'react';
import './style.css';

class Searchbar extends Component {

    constructor() {
        super();

        this.state = {
            searchingKey: ''
        }

        this.updateInput = this.updateInput.bind(this);
    }

    searchSomeThing(event) {
        // if (event.charCode === 13) {
        //     console.log(this.state.searchingKey);
        //     userAction.search(this.state.searchingKey);
        // }
        
    }

    updateInput(event) {
        this.setState({
            searchingKey: event.target.value
        });
    }

    render() {
        return (
            <input 
                    type='text' 
                    name='searchbar' 
                    className='searchbar' 
                    value={this.state.searchingKey} 
                    onChange={this.updateInput} 
                    onKeyPress={this.searchSomeThing}/>
        )
    }
}

export default Searchbar;
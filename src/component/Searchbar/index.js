import React, { Component } from 'react';
import './style.css';
import userAction from '../../actions/userAction';
import { registerHandleResponse, removeHandleResponse } from '../../something';

class Searchbar extends Component {

    constructor() {
        super();

        this.state = {
            searchingKey: ''
        }

        this.updateInput = this.updateInput.bind(this);
        this.searchSomeThing = this.searchSomeThing.bind(this);
    }

    handleResponse(result) {
        if (!result.success) {
            console.log(result);
            return console.log('errrrrrrr');
        }
        userAction.loadSearchResult({
            searchMode: true,
            searchResult: result.result
        });
    }

    componentWillMount() {
        registerHandleResponse('search', this.handleResponse);
    }

    componentWillUnmount() {
        removeHandleResponse('search', this.handleResponse);
    }

    searchSomeThing(event) {
        if (this.state.searchingKey === '') {
            userAction.loadSearchResult({
                searchMode: false,
                searchResult: []
            });
            return;
        }
        event.preventDefault();
        userAction.search(this.state.searchingKey, (err, response) => {
            if (err) console.log(err);
            console.log(response);
        })
    }

    updateInput(event) {
        this.setState({
            searchingKey: event.target.value
        });
    }

    render() {
        return (
            <input
                placeholder="Search user ..."
                type='text'
                name='searchbar'
                className='searchbar'
                value={this.state.searchingKey}
                onChange={this.updateInput}
                onKeyUp={this.searchSomeThing}/>
        )
    }
}

export default Searchbar;

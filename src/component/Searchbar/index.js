import React, { Component } from 'react';
import './style.css';
import userAction from '../../actions/userAction';
import { registerHandleResponse, removeHandleResponse } from '../../something';

class Searchbar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            searchingKey: '',
            flag: props.flag
        }

        this.updateInput = this.updateInput.bind(this);
        this.searchUser = this.searchUser.bind(this);
        this.searchGroup = this.searchGroup.bind(this);
    }

    handleResponse(result) {
        if (!result.success) {
            return console.log(result);
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

    searchUser(event) {
        if (this.state.searchingKey.length === 0) {
            userAction.loadSearchResult({
                searchMode: false,
                searchResult: []
            });
            return;
        }
        if (this.state.searchingKey.length < 2) {
            userAction.loadSearchResult({
                searchMode: true,
                searchResult: []
            });
            return;
        }
        event.preventDefault();
        userAction.search(this.state.searchingKey, (err, response) => {
            if (err) console.log(err);
        })
    }

    searchGroup() {
        console.log('group searching');
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
                onKeyUp={this.state.flag ? this.searchUser: this.searchGroup}
            />
        )
    }
}

export default Searchbar;

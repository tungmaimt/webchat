import React, { Component } from 'react';
import './style.css';

class InputMessage extends Component {
    
    render() {
        return (
            <div className="input-message">
                <input type="text"/>
                <div>some addable icon</div>
            </div>
        );
    }
}

export default InputMessage
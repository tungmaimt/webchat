import React, { Component } from 'react';
import './Modal.css';
import adjustAction from '../../actions/adjustAction';

class Modal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
    }

    this.logS = this.logS.bind(this);
  }

  logS(isOpen) {
    adjustAction.changShowSetting(false);
  }

  render() {
    const { isOpen, children, title } = this.props;

    return (
      <div className={`modal ${isOpen ? 'fade-in' : 'fade-out'}`}>
        <div className="modal-overlay" onClick={this.logS}></div>
        <div className="modal-dialog">
          <div className="modal-header">
            <span className="modal-header-title">{ title }</span>
          </div>
          <div className="modal-content">
            { children }
          </div>
        </div>
      </div>
    )
  }
}

export default Modal

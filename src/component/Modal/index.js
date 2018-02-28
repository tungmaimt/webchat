import React, { Component } from 'react'

import './Modal.css'

class Modal extends Component {

  render() {
    const { isOpen, close, children } = this.props

    return (
      <div className={`modal ${isOpen? 'fade-in' : 'fade-out'}`}>
        <div className="modal-overlay"></div>
        <div className="modal-dialog">
          <div className="modal-header">
            <span className="modal-header-title">Title</span>
            <i className="fa fa-times modal-header-btn" onClick={close}></i>
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

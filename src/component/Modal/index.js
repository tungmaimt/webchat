import React, { Component } from 'react'

import './Modal.css'

class Modal extends Component {

  render() {
    const { isOpen, children, title } = this.props

    return (
      <div className={`modal ${isOpen? 'fade-in' : 'fade-out'}`}>
        <div className="modal-overlay"></div>
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

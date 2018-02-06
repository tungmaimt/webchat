import React, { Component } from 'react';
// import logo from '../logo.svg';
import './App.css';
import Asidebar from './Asidebar';
import Main from './Main';
import { fetchSomething, socket } from '../something';

class App extends Component {
  render() {
    return (
      <div className="flex">
        <Asidebar />
        <Main />
      </div>
    );
  }

  componentDidMount() {

    fetchSomething('/user/tung', (data) => {
      console.log(data);
    });

  }
}

export default App;

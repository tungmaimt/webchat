import React, { Component } from 'react';
import './App.css';
import Asidebar from './Asidebar';
import Main from './Main';
import LoginModal from './LoginModal';
import SideInfo from './SideInfo';


class App extends Component {
  
  render() {
    return (
      <div className="flex">
        <Asidebar />
        <Main />
        <SideInfo />
        <LoginModal />
      </div>
    );
  }

  componentDidMount() {
    // let body = {
    //   username: 'tungmaitest',
    //   password: 'tungmaitest'
    // }

    // let option = {
    //   method: 'POST',
    //   body: JSON.stringify(body),
    //   headers: new Headers({
    //     'content-type': 'application/json'
    //   })
    // };

    // fetchSomething('/api/user', option, (data) => {
    //   console.log(data);
    // });
  }
}

export default App;

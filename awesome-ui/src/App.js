import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Index from "./components/Index";
import OfflineScrambler from "./components/offline-scrambler/OfflineScrambler";
import OnlineScrambler from "./components/online-scrambler/OnlineScrambler";
import About from "./components/About";
import Navbar from "./components/Navbar";

import * as WcaApi from "./functions/wca.api";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { wcif: {}, me: undefined, isLogged: false };
  }

  offlineScramblerLink = "/webscrambles/offline";
  onlineScramblerLink = "/webscrambles/online";
  aboutLink = "/about";

  updateWcif = wcif => {
    let state = this.state;
    state.wcif = wcif;
    this.setState(state);
  };

  generateScrambles = () => {
    console.log("Generating scrambles");
    console.log(this.state.wcif);
  };

  logIn = () => {
    WcaApi.logIn();
  };

  logOut = () => {
    WcaApi.logOut();
    let state = this.state;
    state.me = undefined;
    state.isLogged = false;
    this.setState(state);
  };

  fetchMe = () => {
    if (this.state.me != null) {
      return;
    }

    WcaApi.me()
      .then(result => {
        let state = this.state;
        state.me = result;
        state.isLogged = true;
        this.setState(state);
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return (
      <Router>
        <div className="App">
          <Navbar
            offlineScramblerLink={this.offlineScramblerLink}
            onlineScramblerLink={this.onlineScramblerLink}
            aboutLink={this.aboutLink}
            logIn={this.logIn}
            isLogged={this.state.isLogged}
            logOut={this.logOut}
          />
          <Switch>
            <Route path={this.offlineScramblerLink}>
              <OfflineScrambler
                generateScrambles={this.generateScrambles}
                updateWcif={this.updateWcif}
              />
            </Route>
            <Route path={this.onlineScramblerLink}>
              <OnlineScrambler
                generateScrambles={this.generateScrambles}
                updateWcif={this.updateWcif}
                me={this.state.me}
                fetchMe={this.fetchMe}
              />
            </Route>
            <Route path={this.aboutLink}>
              <About />
            </Route>
            <Route path="/">
              <Index />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

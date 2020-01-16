import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";
import Index from "./components/Index";
import OfflineScrambler from "./components/offline-scrambler/OfflineScrambler";
import OnlineScrambler from "./components/online-scrambler/OnlineScrambler";
import About from "./components/About";

import Navbar from "./components/Navbar";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { wcif: {}, me: undefined };
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

  render() {
    return (
      <Router>
        <div className="App">
          <Navbar
            offlineScramblerLink={this.offlineScramblerLink}
            onlineScramblerLink={this.onlineScramblerLink}
            aboutLink={this.aboutLink}
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

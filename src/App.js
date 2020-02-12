import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Index from "./components/Index";
import OfflineScrambler from "./components/offline-scrambler/OfflineScrambler";
import OnlineScrambler from "./components/online-scrambler/OnlineScrambler";
import About from "./components/About";
import Navbar from "./components/Navbar";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

const mapStateToProps = store => ({
  wcif: store.wcif
});

const App = connect(mapStateToProps)(
  class App extends Component {
    offlineScramblerLink = "/webscrambles/offline";
    onlineScramblerLink = "/webscrambles/online";
    aboutLink = "/about";

    generateScrambles = () => {
      console.log("Generating scrambles");
      console.log(this.props.wcif);
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
                <OfflineScrambler generateScrambles={this.generateScrambles} />
              </Route>
              <Route path={this.onlineScramblerLink}>
                <OnlineScrambler generateScrambles={this.generateScrambles} />
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
);

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

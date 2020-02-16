import React, { Component } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";

import Index from "./components/Index";
import OfflineScrambler from "./components/offline-scrambler/OfflineScrambler";
import OnlineScrambler from "./components/online-scrambler/OnlineScrambler";
import About from "./components/About";
import TnoodleNavbar from "./components/Navbar";
import ManageCompetition from "./components/online-scrambler/ManageCompetition";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

const mapStateToProps = store => ({
  wcif: store.wcif
});

const App = connect(mapStateToProps)(
  class App extends Component {
    homeLink = "/";
    offlineScramblerLink = "/scramble/offline";
    onlineScramblerLink = "/scramble/online";
    aboutLink = "/about";
    competitionLink = "/competitions/:competitionId";

    render() {
      return (
        <HashRouter basename={this.homeLink}>
          <div className="App">
            <TnoodleNavbar
              homeLink={this.homeLink}
              offlineScramblerLink={this.offlineScramblerLink}
              onlineScramblerLink={this.onlineScramblerLink}
              aboutLink={this.aboutLink}
            />
            <Switch>
              <Route path={this.offlineScramblerLink}>
                <OfflineScrambler />
              </Route>
              <Route path={this.onlineScramblerLink}>
                <OnlineScrambler />
              </Route>
              <Route
                path={this.competitionLink}
                component={props => (
                  <ManageCompetition
                    competitionId={props.match.params.competitionId}
                  />
                )}
              ></Route>
              <Route path={this.aboutLink}>
                <About />
              </Route>
              <Route path={this.homeLink}>
                <Index
                  offlineScramblerLink={this.offlineScramblerLink}
                  onlineScramblerLink={this.onlineScramblerLink}
                />
              </Route>
            </Switch>
          </div>
        </HashRouter>
      );
    }
  }
);

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

import React from "react";
import "./App.css";
import Index from "./components/Index";
import OfflineScrambler from "./components/OfflineScrambler";
import OnlineScrambler from "./components/OnlineScrambler";
import About from "./components/About";

import "bootstrap/dist/css/bootstrap.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  let offlineScramblerLink = "/webscrambles/offline";
  let onlineScramblerLink = "/webscrambles/online";
  let aboutLink = "/about";
  return (
    <Router>
      <div className="App">
        <div id="navbar-wrapper">
          <nav
            className="navbar navbar-expand-lg navbar-dark bg-dark static-top"
            id="navbar"
          >
            <div className="container">
              <Link className="navbar-brand" to="/">
                <img
                  className="tnoodle-logo"
                  src={require("./assets/tnoodle_logo.svg")}
                  alt="TNoodle logo"
                />
              </Link>
              <div className="">
                <Link to="/">
                  <h1 className="display-3" id="title">
                    TNoodle
                  </h1>
                </Link>
              </div>
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarResponsive"
                aria-controls="navbarResponsive"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarResponsive">
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to={offlineScramblerLink}>
                      Offline Scrambler
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={onlineScramblerLink}>
                      Online Scrambler
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={aboutLink}>
                      About
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <Switch>
          <Route path={offlineScramblerLink}>
            <OfflineScrambler />
          </Route>
          <Route path={onlineScramblerLink}>
            <OnlineScrambler />
          </Route>
          <Route path={aboutLink}>
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

export default App;

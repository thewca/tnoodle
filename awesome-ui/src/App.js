import React from "react";
import "./App.css";
import Index from "./components/Index";
import OfflineScrambler from "./components/OfflineScrambler";
import OnlineScrambler from "./components/OnlineScrambler";
import About from "./components/About";

import "bootstrap/dist/css/bootstrap.css";

import Navbar from "./components/Navbar";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  let offlineScramblerLink = "/webscrambles/offline";
  let onlineScramblerLink = "/webscrambles/online";
  let aboutLink = "/about";

  let wcif = {};

  let updateWcif = payload => {
    wcif = payload;
  };

  let tnoodleEndpoint = "http://localhost:2014";

  let generateScrambles = () => {
    console.log("Generating scrambles");
    console.log(wcif);

    fetch(tnoodleEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: wcif
    })
      .then(respnse => console.log(respnse))
      .catch(error => console.log(error));
  };

  return (
    <Router>
      <div className="App">
        <Navbar
          offlineScramblerLink={offlineScramblerLink}
          onlineScramblerLink={onlineScramblerLink}
          aboutLink={aboutLink}
        />
        <Switch>
          <Route path={offlineScramblerLink}>
            <OfflineScrambler
              generateScrambles={generateScrambles}
              updateWcif={updateWcif}
            />
          </Route>
          <Route path={onlineScramblerLink}>
            <OnlineScrambler
              generateScrambles={generateScrambles}
              updateWcif={updateWcif}
            />
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

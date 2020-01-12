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

  let wcif = { formatVersion: "1.0", name: "", events: [] };

  let tnoodleEndpoint = "http://localhost:2014";

  let updateEvent = event => {
    let events = wcif.events.filter(e => e.id !== event.id);
    events.push(event);
    wcif.events = events;
  };

  let generateScrambles = () => {
    console.log(generateScrambles);
    console.log(wcif);

    fetch(tnoodleEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        wcif
      })
    })
      .then(r => console.log(r))
      .catch(error => console.log(error));
  };

  let handleCompetitionNameOrPasswordChange = payload => {
    wcif.name = payload.competitionName;
    wcif.password = payload.password;
    console.log(wcif);
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
              updateEvent={updateEvent}
              handleCompetitionNameOrPasswordChange={
                handleCompetitionNameOrPasswordChange
              }
            />
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

import React from "react";
import "./App.css";
import Index from "./components/Index";
import OfflineScrambler from "./components/OfflineScrambler";
import OnlineScrambler from "./components/OnlineScrambler";

import "bootstrap/dist/css/bootstrap.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="header" id="header">
          <div className="container">
            <img
              src={require("./assets/tnoodle_logo.svg")}
              alt="TNoodle logo"
            />
            <h1 className="display-3">TNoodle</h1>
          </div>
        </div>

        <Switch>
          <Route path="/webscrambles/offline">
            <OfflineScrambler />
          </Route>
          <Route path="/webscrambles/online">
            <OnlineScrambler />
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

import React, { Component } from "react";
import Index from "./components/Index";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

class App extends Component {
    homeLink = "/";
    offlineScramblerLink = "/scramble/offline";
    onlineScramblerLink = "/scramble/online";
    competitionLink = "/competitions/:competitionId";

    render() {
        return (
            <div className="App">
                <Index />
            </div>
        );
    }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

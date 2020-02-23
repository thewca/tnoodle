import React, { Component } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import Index from "./components/Index";
import OfflineScrambler from "./components/OfflineScrambler";
import OnlineScrambler from "./components/OnlineScrambler";
import TnoodleNavbar from "./components/TnoodleNavbar";
import ManageCompetition from "./components/ManageCompetition";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

class App extends Component {
    homeLink = "/";
    offlineScramblerLink = "/scramble/offline";
    onlineScramblerLink = "/scramble/online";
    competitionLink = "/competitions/:competitionId";

    render() {
        return (
            <HashRouter basename={this.homeLink}>
                <div className="App">
                    <TnoodleNavbar
                        homeLink={this.homeLink}
                        offlineScramblerLink={this.offlineScramblerLink}
                        onlineScramblerLink={this.onlineScramblerLink}
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
                                    competitionId={
                                        props.match.params.competitionId
                                    }
                                />
                            )}
                        ></Route>
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

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

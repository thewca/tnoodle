import React, { Component } from "react";
import EntryInterface from "./components/EntryInterface";
import EventPickerTable from "./components/EventPickerTable";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-3 bg-dark">
                            <div className="sticky-top">
                                <img
                                    className="tnoodle-logo mt-2"
                                    src={require("./assets/tnoodle_logo.svg")}
                                    alt="TNoodle logo"
                                />
                                <h1 className="display-3" id="title">
                                    TNoodle
                                </h1>
                            </div>
                        </div>
                        <div className="col-9">
                            <EntryInterface />
                            <EventPickerTable />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

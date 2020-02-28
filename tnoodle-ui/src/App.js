import React, { Component } from "react";
import EntryInterface from "./components/EntryInterface";
import EventPickerTable from "./components/EventPickerTable";

import "bootstrap/dist/css/bootstrap.css";

import "./App.css";
import SideBar from "./components/SideBar";

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-3 bg-dark">
                            <SideBar />
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

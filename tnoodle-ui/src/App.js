import React, { Component } from "react";
import EntryInterface from "./components/EntryInterface";
import EventPickerTable from "./components/EventPickerTable";
import SideBar from "./components/SideBar";
import VersionInfo from "./components/VersionInfo";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

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
                            <VersionInfo />
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

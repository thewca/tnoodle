import React, { Component } from "react";
import SideBar from "./components/SideBar";
import VersionInfo from "./components/VersionInfo";
import Interceptor from "./components/Interceptor";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import UserInterface from "./components/UserInterface";

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="container-fluid">
                    <div className="row">
                        <div
                            className="col-3 bg-dark sticky-top overflow-auto"
                            id="side-bar"
                        >
                            <SideBar />
                        </div>
                        <div className="col-9">
                            <Interceptor />
                            <VersionInfo />
                            <UserInterface />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

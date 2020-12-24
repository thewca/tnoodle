import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import SideBar from "./main/components/SideBar";
import Main from "./main/components/Main";

class App extends Component {
    render() {
        return (
            <div className="App container-fluid">
                <div className="row">
                    <div
                        className="col-lg-3 bg-dark overflow-auto"
                        id="side-bar"
                    >
                        <SideBar />
                    </div>
                    <div className="col-lg-9 m-0 p-0">
                        <Main />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

export const BASE_PATH = process.env.PUBLIC_URL;

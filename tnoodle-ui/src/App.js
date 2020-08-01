import React, { Component } from "react";
import EntryInterface from "./components/EntryInterface";
import EventPickerTable from "./components/EventPickerTable";
import SideBar from "./components/SideBar";
import VersionInfo from "./components/VersionInfo";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import fetchIntercept from "fetch-intercept";

class App extends Component {
    constructor() {
        super();

        const that = this;

        // http interceptor
        fetchIntercept.register({
            response: function (response) {
                if (!response.ok) {
                    that.handleHttpError(response);
                }
                return response;
            },

            responseError: function (error) {
                that.handleHttpError(error);
                return Promise.reject(error);
            },
        });

        this.state = { errorMessage: "" };
    }

    handleHttpError = (error) => {
        let message = error.statusText || JSON.stringify(error);
        this.updateErrorMessage(message);
    };

    updateErrorMessage = (errorMessage) => {
        // Clear the message after some seconds
        setTimeout(() => {
            this.setState({ ...this.state, errorMessage: "" });
        }, 1000 * 10);

        this.setState({ ...this.state, errorMessage });
    };

    maybeShowErrorMessage = () => {
        if (!this.state.errorMessage) {
            return null;
        }
        return (
            <div className="row sticky-top">
                <div className={"col-12 alert alert-danger"}>
                    {this.state.errorMessage}
                </div>
            </div>
        );
    };

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
                            {this.maybeShowErrorMessage()}
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

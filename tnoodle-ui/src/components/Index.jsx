import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";

class Index extends Component {
    render() {
        return (
            <div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-3 bg-dark">
                            <div className="sticky-top">
                                <img
                                    className="tnoodle-logo mt-2"
                                    src={require("../assets/tnoodle_logo.svg")}
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

export default Index;

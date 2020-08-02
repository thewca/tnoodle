import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";

class Layout extends Component {
    state = {};
    render() {
        return (
            <form>
                <EntryInterface />
                <EventPickerTable />
            </form>
        );
    }
}

export default Layout;

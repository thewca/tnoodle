import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";

class OfflineScrambler extends Component {
    getDefaultCompetitionName = () => {
        let date = new Date();
        return "Scrambles for " + date.toISOString().split("T")[0];
    };

    render() {
        return (
            <div>
                <EntryInterface
                    name={this.getDefaultCompetitionName()}
                    disabled={false}
                />
                {/* empty events for cleaning when navigating aroud */}
                <EventPickerTable events={[]} />
            </div>
        );
    }
}

export default OfflineScrambler;

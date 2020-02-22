import React, { Component } from "react";
import { connect } from "react-redux";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { updateWcif } from "../redux/ActionCreators";

const mapDispatchToProps = {
    updateWcif: updateWcif
};

const OfflineScrambler = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            // In case the user is navigating around, information from an online competition might be cached.
            // We clear it here just is case.
            props.updateWcif();
        }
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
);

export default OfflineScrambler;

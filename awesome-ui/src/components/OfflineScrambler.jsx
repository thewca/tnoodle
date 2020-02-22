import React, { Component } from "react";
import { connect } from "react-redux";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { updateWcif, updateCompetitionName } from "../redux/ActionCreators";

const mapDispatchToProps = {
    updateWcif,
    updateCompetitionName
};

const OfflineScrambler = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            let competitionName = this.getDefaultCompetitionName();

            // In case the user is navigating around, information from an online competition might be cached.
            // We clear it here just is case. This resets WCIF to default values.
            props.updateWcif();
            props.updateCompetitionName(competitionName);

            this.state = { competitionName };
        }

        getDefaultCompetitionName = () => {
            let date = new Date();
            return "Scrambles for " + date.toISOString().split("T")[0];
        };

        render() {
            return (
                <div>
                    <EntryInterface
                        competitionName={this.state.competitionName}
                        disabled={false}
                    />
                    <EventPickerTable />
                </div>
            );
        }
    }
);

export default OfflineScrambler;

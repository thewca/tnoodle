import React, { Component } from "react";
import { connect } from "react-redux";
import { getCompetitionJson } from "../api/wca.api";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { updateEvents } from "../redux/ActionCreators";
import Loading from "./Loading";
import Error from "./Error";

const mapDispatchToProps = {
    updateEvents
};

const ManageCompetition = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: true,
                error: false,
                competitionId: props.competitionId
            };
        }

        componentDidMount() {
            // Fetch competition json
            getCompetitionJson(this.state.competitionId)
                .then(wcif => {
                    this.setState({
                        ...this.state,
                        loading: false,
                        wcif: wcif
                    });
                    this.props.updateEvents(wcif.events);
                })
                .catch(e => this.setState({ ...this.state, error: true }));
        }

        render() {
            if (this.state.error) {
                return <Error />;
            }
            if (this.state.loading) {
                return <Loading />;
            }
            return (
                <div>
                    <EntryInterface
                        name={this.state.wcif.name}
                        disabled={true}
                    />
                    <EventPickerTable
                        events={this.state.wcif.events}
                        competitionId={this.state.competitionId}
                    />
                </div>
            );
        }
    }
);

export default ManageCompetition;

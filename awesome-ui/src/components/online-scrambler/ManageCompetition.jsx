import React, { Component } from "react";
import { getCompetitionJson } from "../../api/wca.api";
import EventPickerTable from "../offline-scrambler/EventPickerTable";

class ManageCompetition extends Component {
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
            })
            .catch(e => this.setState({ ...this.state, error: true }));
    }

    render() {
        if (this.state.error) {
            return <p>Error fetching information.</p>;
        }
        if (this.state.loading) {
            return (
                <div className="spinner-border m-5" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            );
        }
        return (
            <div>
                <EventPickerTable events={this.state.wcif.events} />
            </div>
        );
    }
}
export default ManageCompetition;

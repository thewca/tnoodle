import React, { Component } from "react";
import { connect } from "react-redux";
import { getCompetitionJson } from "../api/wca.api";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { updateWcif } from "../redux/ActionCreators";
import Loading from "./Loading";
import Error from "./Error";

const mapDispatchToProps = {
    updateWcif
};

const ManageCompetition = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: false,
                error: false,
                competitionId: props.competitionId,
                wcif: null
            };
        }

        componentDidMount() {
            this.setLoading(true);
            // Fetch competition json
            getCompetitionJson(this.state.competitionId)
                .then(wcif => {
                    this.setState({
                        ...this.state,
                        wcif: wcif
                    });
                    this.props.updateWcif(wcif);
                    this.setLoading(false);
                })
                .catch(e => {
                    console.log(e);
                    this.setState({ ...this.state, error: true });
                });
        }

        setLoading = flag => this.setState({ ...this.state, loading: flag });

        render() {
            if (this.state.error) {
                return <Error />;
            }
            if (this.state.loading) {
                return <Loading />;
            }
            if (this.state.wcif != null) {
                return (
                    <div>
                        <EntryInterface
                            competitionName={this.state.wcif.name}
                            disabled={true}
                        />
                        <EventPickerTable
                            competitionId={this.state.competitionId}
                        />
                    </div>
                );
            }
            return <p>Nothong to show.</p>;
        }
    }
);

export default ManageCompetition;

import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { toWcaUrl, getUpcomingManageableCompetitions } from "../api/wca.api";
import { updateCompetitions } from "../redux/ActionCreators";
import Loading from "./Loading";
import Error from "./Error";

const mapStateToProps = store => ({
    competitions: store.competitions
});

const mapDispatchToProps = {
    updateCompetitions: updateCompetitions
};

const SelectCompetition = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                competitions: props.competitions,
                loading: false,
                error: false
            };
        }

        // This is pretty much for caching competitions
        componentDidMount() {
            if (this.state.competitions == null) {
                this.setState({ ...this.state, loading: true });
                getUpcomingManageableCompetitions()
                    .then(competitions =>
                        this.handleUpdateCompetitions(competitions)
                    )
                    .catch(e => {
                        this.setState({
                            ...this.state,
                            error: true
                        });
                    });
            }
        }

        handleUpdateCompetitions = competitions => {
            this.setState({ ...this.state, competitions: competitions });
            this.props.updateCompetitions(competitions);
        };

        render() {
            if (this.state.error) {
                return <Error />;
            }
            if (this.state.loading) {
                return <Loading />;
            }
            if (this.state.competitions == null) {
                return <div>Nothing to show</div>;
            }
            return (
                <div className="competitions-picker">
                    <h5 className="text-center">
                        Select an upcoming competition:
                    </h5>
                    {this.state.competitions.length === 0 ? (
                        <div className="text-center">
                            No competitions found, are you sure you have
                            upcoming competitions? Try checking{" "}
                            <a href={toWcaUrl("/competitions/mine")}>
                                on the WCA website
                            </a>
                            .
                        </div>
                    ) : (
                        <div className="list-group">
                            {this.state.competitions.map(competition => {
                                return (
                                    <Link
                                        key={competition.id}
                                        to={`/competitions/${competition.id}`}
                                        className="list-group-item list-group-item-action"
                                    >
                                        {competition.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
    }
);

export default SelectCompetition;

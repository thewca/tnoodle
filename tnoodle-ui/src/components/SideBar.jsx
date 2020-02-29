import React, { Component } from "react";
import { connect } from "react-redux";
import Loading from "./Loading";
import {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions,
    updateMe,
    updateCompetitionId
} from "../redux/ActionCreators";
import { defaultWcif } from "../constants/default.wcif";
import {
    isLogged,
    logIn,
    logOut,
    fetchMe,
    getUpcomingManageableCompetitions,
    getCompetitionJson
} from "../api/wca.api";
import { getDefaultCompetitionName } from "../util/competition.name.util";

const mapStateToProps = store => ({
    me: store.me,
    competitions: store.competitions
});

const mapDispatchToProps = {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions,
    updateMe,
    updateCompetitionId
};

const SideBar = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.state = {
                me: props.me,
                competitions: props.competitions,
                loadingUser: false,
                loadingCompetitions: false,
                loadingCompetitionInformation: false,
                competitionId: null
            };
        }

        setLoadingUser = flag => {
            this.setState({ ...this.state, loadingUser: flag });
        };

        setLoadingCompetitions = flag => {
            this.setState({ ...this.state, loadingCompetitions: flag });
        };

        setLoadingCompetitionInformation = flag => {
            this.setState({
                ...this.state,
                loadingCompetitionInformation: flag
            });
        };

        componentDidMount() {
            if (this.state.me == null && isLogged()) {
                this.setLoadingUser(true);
                fetchMe()
                    .then(me => {
                        this.setState({ ...this.state, me });
                        this.props.updateMe(me);
                        this.setLoadingUser(false);
                    })
                    .catch(e => {
                        console.error(
                            "Could not get information about the logged user",
                            e
                        );
                        this.setLoadingUser(false);
                    });
            }

            if (this.state.competitions == null && isLogged()) {
                this.setLoadingCompetitions(true);
                getUpcomingManageableCompetitions()
                    .then(competitions => {
                        this.setState({ ...this.state, competitions });
                        this.props.updateCompetitions(competitions);
                        this.setLoadingCompetitions(false);
                    })
                    .catch(e => {
                        console.error("Could not get upcoming competitions", e);
                        this.setLoadingCompetitions(false);
                    });
            }
        }

        handleManualSelection = () => {
            this.props.updateEditingStatus(false);
            this.props.updateCompetitionId(null);
            this.props.updateWcif({ ...defaultWcif });
            this.props.updateCompetitionName(getDefaultCompetitionName());
        };

        handleCompetitionSelection = competitionId => {
            this.setState({
                ...this.state,
                loadingCompetitionInformation: true,
                competitionId
            });
            getCompetitionJson(competitionId)
                .then(wcif => {
                    this.setLoadingCompetitionInformation(false);
                    this.props.updateEditingStatus(true);
                    this.props.updateWcif(wcif);
                    this.props.updateCompetitionId(wcif.id);
                    this.props.updateCompetitionName(wcif.name);
                })
                .catch(e => {
                    console.error(
                        "Could not get information for " + competitionId,
                        e
                    );
                    this.setLoadingCompetitionInformation(false);
                });
        };

        logInButton = () => {
            return (
                <li className="pt-2">
                    <button
                        type="button"
                        className="btn btn-light btn-lg btn-block btn-outline-secondary"
                        onClick={isLogged() ? logOut : logIn}
                    >
                        {isLogged() ? "Log Out" : "Log In"}
                    </button>
                </li>
            );
        };

        loadingArea = () => {
            if (this.state.loadingUser) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>Loading user...</p>
                    </div>
                );
            }

            if (this.state.loadingCompetitions) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>Loading competitions...</p>
                    </div>
                );
            }

            if (this.state.loadingCompetitionInformation) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>
                            Loading information for {this.state.competitionId}
                            ...
                        </p>
                    </div>
                );
            }
        };

        render() {
            return (
                <div className="sticky-top">
                    <img
                        className="tnoodle-logo mt-2"
                        src={require("../assets/tnoodle_logo.svg")}
                        alt="TNoodle logo"
                    />
                    <h1 className="display-3" id="title">
                        TNoodle
                    </h1>
                    <ul className="list-group">
                        <li>
                            <button
                                type="button"
                                className="btn btn-dark btn-lg btn-block btn-outline-light mb-2"
                                onClick={this.handleManualSelection}
                            >
                                Manual Selection
                            </button>
                        </li>
                        {this.state.competitions != null &&
                            this.state.competitions.map((competition, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        className="btn btn-dark btn-lg btn-block btn-outline-light"
                                        onClick={_ =>
                                            this.handleCompetitionSelection(
                                                competition.id
                                            )
                                        }
                                    >
                                        {competition.name}
                                    </button>
                                </li>
                            ))}
                        {this.logInButton()}
                    </ul>
                    {this.loadingArea()}
                </div>
            );
        }
    }
);

export default SideBar;

import React, { Component } from "react";
import { connect } from "react-redux";
import Loading from "./Loading";
import {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions
} from "../redux/ActionCreators";
import { defaultWcif } from "../constants/default.wcif";
import {
    isLogged,
    logIn,
    logOut,
    fetchMe,
    getUpcomingManageableCompetitions
} from "../api/wca.api";

const mapStateToProps = store => ({
    me: store.me,
    competitions: store.competitions,
    competitionId: store.competitionId
});

const mapDispatchToProps = {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions
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
                loadingCompetitionInformation: false
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
            this.setLoadingUser(true);
            if (this.state.me == null && isLogged()) {
                fetchMe()
                    .then(me => {
                        this.setState({ ...this.state, me });
                        this.props.updateMe(me);
                        this.setLoadingUser(false);
                    })
                    .catch(e => {
                        console.log(
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
                        console.log("Could not get upcoming competitions", e);
                        this.setLoadingCompetitions(false);
                    });
            }
        }

        handleManualSelection = () => {
            this.props.updateWcif(defaultWcif);
            this.props.updateEditingStatus(false);
        };

        handleCompetitionSelection = competitionId => {
            console.log(competitionId);
        };

        logInButton = () => {
            return (
                <li className="pt-3">
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
                                className="btn btn-dark btn-lg btn-block btn-outline-light"
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

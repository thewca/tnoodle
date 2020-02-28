import React, { Component } from "react";
import { connect } from "react-redux";
import { updateWcif, updateEditingStatus } from "../redux/ActionCreators";
import { defaultWcif } from "../constants/default.wcif";

const mapDispatchToProps = {
    updateWcif,
    updateEditingStatus
};

const SideBar = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        handleManualSelection = () => {
            this.props.updateWcif(defaultWcif);
            this.props.updateEditingStatus(true);
        };

        handleCompetitionSelection = () => {
            let wcif = {
                formatVersion: "1.0",
                id: "FMCBrasil2019",
                name: "FMC Brasil 2019",
                shortName: "FMC Brasil 2019",
                events: [
                    {
                        id: "333fm",
                        rounds: [
                            {
                                id: "333fm-r1",
                                format: "m",
                                timeLimit: null,
                                cutoff: null,
                                advancementCondition: {
                                    type: "percent",
                                    level: 75
                                },
                                scrambleSetCount: 1,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "333fm-r2",
                                format: "m",
                                timeLimit: null,
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 1,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    }
                ],
                schedule: {
                    startDate: "2019-02-10",
                    numberOfDays: 1,
                    venues: [
                        {
                            id: 2,
                            name:
                                "[Múltiplos lugares](https://www.worldcubeassociation.org/competitions/FMCBrasil2019#4113-lugares)",
                            latitudeMicrodegrees: -15822291,
                            longitudeMicrodegrees: -47928765,
                            countryIso2: "BR",
                            timezone: "America/Sao_Paulo",
                            rooms: [
                                {
                                    id: 3,
                                    name: "Sala",
                                    color: "#304a96",
                                    activities: [
                                        {
                                            id: 13,
                                            name:
                                                "3x3x3 Fewest Moves, Round 1, Attempt 1",
                                            activityCode: "333fm-r1-a1",
                                            startTime: "2019-02-10T11:00:00Z",
                                            endTime: "2019-02-10T12:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 14,
                                            name:
                                                "3x3x3 Fewest Moves, Round 1, Attempt 2",
                                            activityCode: "333fm-r1-a2",
                                            startTime: "2019-02-10T12:30:00Z",
                                            endTime: "2019-02-10T13:30:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 15,
                                            name:
                                                "3x3x3 Fewest Moves, Round 1, Attempt 3",
                                            activityCode: "333fm-r1-a3",
                                            startTime: "2019-02-10T14:00:00Z",
                                            endTime: "2019-02-10T15:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 17,
                                            name:
                                                "3x3x3 Fewest Moves, Round 2, Attempt 1",
                                            activityCode: "333fm-r2-a1",
                                            startTime: "2019-02-10T16:00:00Z",
                                            endTime: "2019-02-10T17:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 18,
                                            name:
                                                "3x3x3 Fewest Moves, Round 2, Attempt 2",
                                            activityCode: "333fm-r2-a2",
                                            startTime: "2019-02-10T17:30:00Z",
                                            endTime: "2019-02-10T18:30:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 19,
                                            name:
                                                "3x3x3 Fewest Moves, Round 2, Attempt 3",
                                            activityCode: "333fm-r2-a3",
                                            startTime: "2019-02-10T19:00:00Z",
                                            endTime: "2019-02-10T20:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 25,
                                            name: "Intervalo (break)",
                                            activityCode: "other-misc",
                                            startTime: "2019-02-10T12:00:00Z",
                                            endTime: "2019-02-10T12:30:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 26,
                                            name: "Intervalo (break)",
                                            activityCode: "other-misc",
                                            startTime: "2019-02-10T13:30:00Z",
                                            endTime: "2019-02-10T14:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 27,
                                            name: "Intervalo (break)",
                                            activityCode: "other-misc",
                                            startTime: "2019-02-10T17:00:00Z",
                                            endTime: "2019-02-10T17:30:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 28,
                                            name: "Intervalo (break)",
                                            activityCode: "other-misc",
                                            startTime: "2019-02-10T18:30:00Z",
                                            endTime: "2019-02-10T19:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 29,
                                            name:
                                                "Credenciamento (registration)",
                                            activityCode: "other-registration",
                                            startTime: "2019-02-10T10:30:00Z",
                                            endTime: "2019-02-10T11:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 30,
                                            name: "Premiação (awards)",
                                            activityCode: "other-awards",
                                            startTime: "2019-02-10T20:00:00Z",
                                            endTime: "2019-02-10T20:30:00Z",
                                            childActivities: [],
                                            extensions: []
                                        },
                                        {
                                            id: 31,
                                            name: "Almoço (lunch)",
                                            activityCode: "other-lunch",
                                            startTime: "2019-02-10T15:00:00Z",
                                            endTime: "2019-02-10T16:00:00Z",
                                            childActivities: [],
                                            extensions: []
                                        }
                                    ],
                                    extensions: []
                                }
                            ],
                            extensions: []
                        }
                    ]
                },
                competitorLimit: null,
                extensions: []
            };

            this.props.updateWcif(wcif);
            this.props.updateEditingStatus(false);
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
                        <li>
                            <button
                                type="button"
                                className="btn btn-dark btn-lg btn-block btn-outline-light"
                                onClick={this.handleCompetitionSelection}
                            >
                                Competition 1
                            </button>
                        </li>
                    </ul>
                </div>
            );
        }
    }
);

export default SideBar;

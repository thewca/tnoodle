import React, { Component } from "react";
import { connect } from "react-redux";
import {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName
} from "../redux/ActionCreators";
import { defaultWcif } from "../constants/default.wcif";

const mapDispatchToProps = {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName
};

const SideBar = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        handleManualSelection = () => {
            this.props.updateWcif(defaultWcif);
            this.props.updateEditingStatus(false);
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
                competitorLimit: null,
                extensions: []
            };

            this.props.updateWcif(wcif);
            this.props.updateEditingStatus(true);
            this.props.updateCompetitionName("FMC Brasil 2019");
        };

        handleCompetitionSelection2 = () => {
            let wcif = {
                formatVersion: "1.0",
                id: "UberlandiaOpen2019",
                name: "Uberlândia Open 2019",
                shortName: "Uberlândia Open 2019",

                events: [
                    {
                        id: "333",
                        rounds: [
                            {
                                id: "333-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 30000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: {
                                    type: "ranking",
                                    level: 20
                                },
                                scrambleSetCount: 4,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "333-r2",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 18000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: {
                                    type: "ranking",
                                    level: 12
                                },
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "333-r3",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 12000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "222",
                        rounds: [
                            {
                                id: "222-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 24000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: {
                                    type: "percent",
                                    level: 75
                                },
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "222-r2",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 18000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: {
                                    type: "ranking",
                                    level: 6
                                },
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "222-r3",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 12000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 2,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "444",
                        rounds: [
                            {
                                id: "444-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 30000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 2,
                                    attemptResult: 12000
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "555",
                        rounds: [
                            {
                                id: "555-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 36000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 2,
                                    attemptResult: 18000
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "666",
                        rounds: [
                            {
                                id: "666-r1",
                                format: "m",
                                timeLimit: {
                                    centiseconds: 60000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 1,
                                    attemptResult: 30000
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "777",
                        rounds: [
                            {
                                id: "777-r1",
                                format: "m",
                                timeLimit: {
                                    centiseconds: 90000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 1,
                                    attemptResult: 48000
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "333bf",
                        rounds: [
                            {
                                id: "333bf-r1",
                                format: "3",
                                timeLimit: {
                                    centiseconds: 120000,
                                    cumulativeRoundIds: ["333bf-r1"]
                                },
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "333fm",
                        rounds: [
                            {
                                id: "333fm-r1",
                                format: "m",
                                timeLimit: null,
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 2,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "333oh",
                        rounds: [
                            {
                                id: "333oh-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 24000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 2,
                                    attemptResult: 12000
                                },
                                advancementCondition: {
                                    type: "ranking",
                                    level: 4
                                },
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            },
                            {
                                id: "333oh-r2",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 18000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 2,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "clock",
                        rounds: [
                            {
                                id: "clock-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 12000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 2,
                                    attemptResult: 4500
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "minx",
                        rounds: [
                            {
                                id: "minx-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 30000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: {
                                    numberOfAttempts: 2,
                                    attemptResult: 21000
                                },
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "pyram",
                        rounds: [
                            {
                                id: "pyram-r1",
                                format: "a",
                                timeLimit: {
                                    centiseconds: 12000,
                                    cumulativeRoundIds: []
                                },
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 3,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    },
                    {
                        id: "333mbf",
                        rounds: [
                            {
                                id: "333mbf-r1",
                                format: "2",
                                timeLimit: null,
                                cutoff: null,
                                advancementCondition: null,
                                scrambleSetCount: 2,
                                results: [],
                                extensions: []
                            }
                        ],
                        extensions: []
                    }
                ],

                competitorLimit: 50,
                extensions: []
            };

            this.props.updateWcif(wcif);
            this.props.updateEditingStatus(true);
            this.props.updateCompetitionName("Uberlândia Open 2019");
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
                        <li>
                            <button
                                type="button"
                                className="btn btn-dark btn-lg btn-block btn-outline-light"
                                onClick={this.handleCompetitionSelection2}
                            >
                                Competition 2
                            </button>
                        </li>
                    </ul>
                </div>
            );
        }
    }
);

export default SideBar;

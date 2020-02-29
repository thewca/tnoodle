import React, { Component } from "react";
import { connect } from "react-redux";
import CubingIcon from "./CubingIcon";
import { MAX_WCA_ROUNDS, FORMATS } from "../constants/wca.constants";
import { updateWcaEvent, updateMbld } from "../redux/ActionCreators";
import { MBLD_MIN } from "../constants/wca.constants";

const mapStateToProps = store => ({
    mbld: store.mbld,
    editingDisabled: store.editingDisabled,
    wcif: store.wcif
});

const mapDispatchToProps = {
    updateWcaEvent: updateWcaEvent,
    updateMbld: updateMbld
};

const EventPicker = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.setBlobNull = props.setBlobNull;

            this.state = {
                id: props.event.id
            };

            if (this.state.id === "333mbf") {
                this.state.mbld = props.mbld;
            }
        }

        getWcaEvent = rounds => {
            return { id: this.state.id, rounds };
        };

        handleNumberOfRoundsChange = (rounds, value) => {
            let numberOfRounds = Number(value);

            if (numberOfRounds < 0 || numberOfRounds > MAX_WCA_ROUNDS) {
                return;
            }

            // Ajust the number of rounds in case we have to remove
            while (rounds.length > numberOfRounds) {
                rounds.pop();
            }

            // case we have to add
            let eventId = this.state.id;
            while (rounds.length < numberOfRounds) {
                rounds.push({
                    id: eventId + "-r" + (rounds.length + 1),
                    format: this.props.event.format_ids[0],
                    scrambleSetCount: 1,
                    copies: 1
                });
            }
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleNumberOfScrambleSetsChange = (round, value, rounds) => {
            if (value < 1) {
                return;
            }
            rounds[round].scrambleSetCount = Number(value);
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleRoundFormatChanged = (round, value, rounds) => {
            rounds[round].format = value;
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleNumberOfCopiesChange = (round, value, rounds) => {
            if (value < 1) {
                return;
            }
            rounds[round].copies = value;
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        abbreviate = str => {
            return FORMATS[str].shortName;
        };

        updateEvent = wcaEvent => {
            this.setBlobNull();
            this.props.updateWcaEvent(wcaEvent);
        };

        handleMbldChange = mbld => {
            this.setState({ ...this.state, mbld: mbld });
            this.props.updateMbld(mbld);
        };

        // When mbld loses focus
        verifyMbld = () => {
            // TODO search for the best result and warn if someone selects less mbld than this.
            let mbld = this.state.mbld;
            if (mbld < MBLD_MIN) {
                mbld = MBLD_MIN;
                this.handleMbldChange(mbld);
            }
        };

        maybeShowMbld = rounds => {
            if (this.state.id === "333mbf" && rounds.length > 0) {
                return (
                    <tfoot>
                        <tr>
                            <th colSpan={3}>
                                <p className="text-right">
                                    Select the number of scrambles
                                </p>
                            </th>
                            <td>
                                <input
                                    className="form-control bg-dark text-white"
                                    type="number"
                                    value={this.state.mbld}
                                    onChange={evt =>
                                        this.handleMbldChange(
                                            Number(evt.target.value)
                                        )
                                    }
                                    min={MBLD_MIN}
                                    onBlur={this.verifyMbld}
                                />
                            </td>
                        </tr>
                    </tfoot>
                );
            }
        };

        maybeShowTableTitles = rounds => {
            if (rounds.length === 0) {
                return null;
            }
            return (
                <tr className="thead-light">
                    <th scope="col">#</th>
                    <th scope="col">Format</th>
                    <th scope="col">Scramble Sets</th>
                    <th scope="col">Copies</th>
                </tr>
            );
        };

        maybeShowTableBody = (event, rounds) => {
            if (rounds.length === 0) {
                return;
            }
            return (
                <tbody>
                    {Array.from({ length: rounds.length }, (_, i) => {
                        return (
                            <tr key={i} className="form-group">
                                <th scope="row" className="align-middle">
                                    {i + 1}
                                </th>
                                <td className="align-middle">
                                    <select
                                        onChange={evt =>
                                            this.handleRoundFormatChanged(
                                                i,
                                                evt.target.value,
                                                rounds
                                            )
                                        }
                                        disabled={
                                            this.props.editingDisabled
                                                ? "disabled"
                                                : ""
                                        }
                                    >
                                        {event.format_ids.map(format => (
                                            <option key={format} value={format}>
                                                {this.abbreviate(format)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={rounds[i].scrambleSetCount}
                                        onChange={evt =>
                                            this.handleNumberOfScrambleSetsChange(
                                                i,
                                                Number(evt.target.value),
                                                rounds
                                            )
                                        }
                                        min={1}
                                        disabled={
                                            this.props.editingDisabled
                                                ? "disabled"
                                                : ""
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={rounds[i].copies}
                                        onChange={evt =>
                                            this.handleNumberOfCopiesChange(
                                                i,
                                                Number(evt.target.value),
                                                rounds
                                            )
                                        }
                                        min={1}
                                        disabled={
                                            this.props.editingDisabled
                                                ? "disabled"
                                                : ""
                                        }
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            );
        };

        render() {
            let wcaEvent = this.props.wcif.events.find(
                event => event.id === this.state.id
            );
            let rounds = wcaEvent != null ? wcaEvent.rounds : [];
            let { event } = this.props;

            let styleFirstTwoColumns = { width: "10%" };
            let styleLastTwoColumns = { width: "40%" };

            return (
                <table className="table table-sm m-0 shadow rounded">
                    <thead>
                        <tr
                            className={
                                rounds.length === 0
                                    ? "bg-secondary text-white"
                                    : "thead-light"
                            }
                        >
                            <th style={styleFirstTwoColumns} scope="col"></th>
                            <th style={styleFirstTwoColumns} scope="col">
                                <CubingIcon event={event.id} />
                            </th>
                            <th style={styleLastTwoColumns} scope="col">
                                <h5 className="font-weight-bold">
                                    {event.name}
                                </h5>
                            </th>
                            <th style={styleLastTwoColumns} scope="col">
                                <label>Rounds</label>
                                <input
                                    className="bg-light form-control"
                                    type="number"
                                    value={rounds.length}
                                    onChange={evt =>
                                        this.handleNumberOfRoundsChange(
                                            rounds,
                                            Number(evt.target.value)
                                        )
                                    }
                                    min={0}
                                    max={MAX_WCA_ROUNDS}
                                />
                            </th>
                        </tr>
                        {this.maybeShowTableTitles(rounds)}
                    </thead>
                    {this.maybeShowTableBody(event, rounds)}
                    {this.maybeShowMbld(rounds)}
                </table>
            );
        }
    }
);

export default EventPicker;

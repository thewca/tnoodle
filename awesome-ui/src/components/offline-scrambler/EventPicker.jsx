import React, { Component } from "react";
import CubingIcon from "../CubingIcon";
import { MAX_WCA_ROUNDS, FORMATS } from "../../constants/wca.constants";
import { connect } from "react-redux";
import { updateWcaEvent, updateMbld } from "../../redux/ActionCreators";
import { MBLD_MIN } from "../../constants/wca.constants";

const mapStateToProps = store => ({
    mbld: store.wcif.mbld
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

            // State wcif like
            let wcifEvent = props.wcifEvent || { rounds: [] };

            // If we ever support copies on the website, we can dismiss this
            wcifEvent.rounds.forEach(round => (round.copies = 1));

            this.state = {
                id: props.event.id,
                rounds: wcifEvent.rounds,
                disabled: props.disabled
            };

            if (this.state.id === "333mbf") {
                this.state.mbld = props.mbld;
            }

            updateWcaEvent(this.state);
        }

        handleNumberOfRoundsChange = evt => {
            let numberOfRounds = Number(evt.target.value);
            let state = this.state;
            let rounds = state.rounds;

            // Ajust the number of rounds in case we have to remove
            while (rounds.length > numberOfRounds) {
                rounds.pop();
            }

            // case we have to add
            let event = this.state.id;
            while (rounds.length < numberOfRounds) {
                rounds.push({
                    id: event + "-r" + (rounds.length + 1),
                    format: this.props.event.format_ids[0],
                    scrambleSetCount: 1,
                    copies: 1
                });
            }
            state.rounds = rounds;
            this.setState(state);
            this.updateEvent();
        };

        handleNumberOfScrambleSetsChange = (round, value) => {
            if (value < 1) {
                return;
            }
            let state = this.state;
            state.rounds[round].scrambleSetCount = Number(value);
            this.setState(state);
            this.updateEvent();
        };

        roundFormatChanged = (round, value) => {
            let state = this.state;
            state.rounds[round].format = value;
            this.setState(state);
            this.updateEvent();
        };

        handleNumberOfCopiesChange = (round, value) => {
            if (value < 1) {
                return;
            }
            let state = this.state;
            state.rounds[round].copies = value;
            this.setState(state);
            this.updateEvent();
        };

        abbreviate = str => {
            return FORMATS[str].shortName;
        };

        updateEvent = () => {
            this.props.updateWcaEvent(this.state);
        };

        handleMbldChange = mbld => {
            this.setState({ ...this.state, mbld: mbld });
            this.props.updateMbld(mbld);
        };

        // When mbld loses focus
        verifyMbld = () => {
            let mbld = this.state.mbld;
            if (mbld < MBLD_MIN) {
                mbld = MBLD_MIN;
                this.handleMbldChange(mbld);
            }
        };

        maybeShowMbld = () => {
            if (this.state.id === "333mbf" && this.state.rounds.length > 0) {
                return (
                    <tfoot>
                        <tr>
                            <th colSpan={3} className="align-middle">
                                Number of scrambles
                            </th>
                            <td>
                                <input
                                    className="form-control"
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

        maybeShowTableTitles = () => {
            if (this.state.rounds.length === 0) {
                return;
            }
            return (
                <tr className="thead-light">
                    <th>#</th>
                    <th>Format</th>
                    <th>Scramble Sets</th>
                    <th>Copies</th>
                </tr>
            );
        };

        maybeShowTableBody = event => {
            if (this.state.rounds.length === 0) {
                return;
            }
            return (
                <tbody>
                    {Array.from(
                        { length: this.state.rounds.length },
                        (_, i) => {
                            return (
                                <tr key={i} className="form-group">
                                    <td className="align-middle">{i + 1}</td>
                                    <td className="align-middle">
                                        <select
                                            onChange={evt =>
                                                this.roundFormatChanged(
                                                    i,
                                                    evt.target.value
                                                )
                                            }
                                            disabled={
                                                this.state.disabled
                                                    ? "disabled"
                                                    : ""
                                            }
                                        >
                                            {event.format_ids.map(format => (
                                                <option
                                                    key={format}
                                                    value={format}
                                                >
                                                    {this.abbreviate(format)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            className="form-control"
                                            type="number"
                                            value={
                                                this.state.rounds[i]
                                                    .scrambleSetCount
                                            }
                                            onChange={evt =>
                                                this.handleNumberOfScrambleSetsChange(
                                                    i,
                                                    Number(evt.target.value)
                                                )
                                            }
                                            min={1}
                                            disabled={
                                                this.state.disabled
                                                    ? "disabled"
                                                    : ""
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className="form-control"
                                            type="number"
                                            value={this.state.rounds[i].copies}
                                            onChange={evt =>
                                                this.handleNumberOfCopiesChange(
                                                    i,
                                                    Number(evt.target.value)
                                                )
                                            }
                                            min={1}
                                            disabled={
                                                this.state.disabled
                                                    ? "disabled"
                                                    : ""
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        }
                    )}
                </tbody>
            );
        };

        render() {
            let { event } = this.props;
            let options = [
                { text: "# of rounds?", value: 0, disabled: false },
                { text: "────────", disabled: true }
            ];
            Array.from({ length: MAX_WCA_ROUNDS }).forEach((_, i) => {
                options.push({
                    text: i + 1 + " round" + (i > 0 ? "s" : ""),
                    value: i + 1,
                    disabled: false
                });
            });
            return (
                <div
                    className={
                        "container border rounded m-3 shadow " +
                        (this.state.rounds.length === 0 ? "bg-secondary" : "")
                    }
                >
                    <table className="table">
                        <thead>
                            <tr
                                className={
                                    this.state.rounds.length === 0
                                        ? "text-white"
                                        : ""
                                }
                            >
                                <th></th>
                                <th>
                                    <CubingIcon event={event.id} />
                                </th>
                                <th>
                                    <h5 className="font-weight-bold">
                                        {event.name}
                                    </h5>
                                </th>
                                <th>
                                    <select
                                        onChange={
                                            this.handleNumberOfRoundsChange
                                        }
                                        id={event.id}
                                        defaultValue={this.state.rounds.length}
                                        disabled={
                                            this.state.disabled
                                                ? "disabled"
                                                : ""
                                        }
                                    >
                                        {options.map(op => (
                                            <option
                                                value={op.value}
                                                disabled={op.disabled}
                                                key={op.text}
                                            >
                                                {op.text}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            </tr>
                            {this.maybeShowTableTitles()}
                        </thead>
                        {this.maybeShowTableBody(event)}
                        {this.maybeShowMbld()}
                    </table>
                </div>
            );
        }
    }
);

export default EventPicker;

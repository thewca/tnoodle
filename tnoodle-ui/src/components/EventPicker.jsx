import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import CubingIcon from "./CubingIcon";
import { MAX_WCA_ROUNDS, FORMATS } from "../constants/wca.constants";
import {
    updateWcaEvent,
    updateMbld,
    updateFileZipBlob,
    updateTranslation,
    selectAllTranslations,
    resetTranslations,
    setSuggestedFmcTranslations
} from "../redux/ActionCreators";
import { MBLD_MIN } from "../constants/wca.constants";
import {
    getDefaultCopiesExtension,
    copiesExtensionId
} from "../api/tnoodle.api";

const mapStateToProps = store => ({
    mbld: store.mbld,
    editingDisabled: store.editingDisabled,
    wcif: store.wcif,
    translations: store.translations,
    suggestedFmcTranslations: store.suggestedFmcTranslations,
    bestMbldAttempt: store.bestMbldAttempt
});

const mapDispatchToProps = {
    updateWcaEvent,
    updateMbld,
    updateFileZipBlob,
    updateTranslation,
    selectAllTranslations,
    resetTranslations,
    setSuggestedFmcTranslations
};

const EventPicker = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.state = {
                id: props.event.id
            };

            if (this.state.id === "333mbf") {
                this.state.mbld = props.mbld;
            }

            if (this.state.id === "333fm") {
                this.state.translationsPerLine = 4;
                this.state.showTranslations = false;
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
                    extensions: [getDefaultCopiesExtension()]
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
            rounds[round].extensions.find(
                extension => extension.id === copiesExtensionId
            ).data.numCopies = value;
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        abbreviate = str => {
            return FORMATS[str].shortName;
        };

        updateEvent = wcaEvent => {
            this.props.updateFileZipBlob(null);
            this.props.updateWcaEvent(wcaEvent);
        };

        handleMbldChange = mbld => {
            this.setState({ ...this.state, mbld });
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
                        {this.showMbldWarning()}
                    </tfoot>
                );
            }
        };

        showMbldWarning = () => {
            let bestMbldAttempt = this.props.bestMbldAttempt;
            let showMbldWarning =
                bestMbldAttempt != null && this.props.mbld < bestMbldAttempt;

            if (showMbldWarning) {
                return (
                    <tr className="bg-warning">
                        <th colSpan={4}>
                            {`You selected ${this.state.mbld} cubes for Multi-Blind, but there's a competitor who already tried ${this.props.bestMbldAttempt} at a competition. Proceed if you are really certain of it.`}
                        </th>
                    </tr>
                );
            }
        };

        handleTranslation = id => {
            this.props.updateFileZipBlob(null);
            this.props.updateTranslation(id);
        };

        selectAllTranslations = () => {
            this.props.updateFileZipBlob(null);
            this.props.selectAllTranslations();
        };

        selectNoneTranslation = () => {
            this.props.updateFileZipBlob(null);
            this.props.resetTranslations();
        };

        selectSuggestedTranslations = () => {
            this.props.updateFileZipBlob(null);
            this.props.setSuggestedFmcTranslations(
                this.props.suggestedFmcTranslations
            );
        };

        toggleTranslations = () => {
            this.setState({
                ...this.state,
                showTranslations: !this.state.showTranslations
            });
        };

        maybeShowFmcTranslations = numberOfRounds => {
            if (this.state.id !== "333fm" || this.props.translations == null) {
                return;
            }

            if (numberOfRounds > 0) {
                return (
                    <tfoot>
                        <tr>
                            <th colSpan={4} className="text-center">
                                <button
                                    className="btn btn-info"
                                    onClick={this.toggleTranslations}
                                >
                                    Translations
                                </button>
                            </th>
                        </tr>
                        {this.maybeShowFmcTranslationsDetails()}
                    </tfoot>
                );
            }
        };

        maybeShowFmcTranslationsDetails = () => {
            if (!this.state.showTranslations) {
                return;
            }
            let translations = _.chunk(
                this.props.translations,
                this.state.translationsPerLine
            );

            let chunkWidth = 100.0 / this.state.translationsPerLine; // For each translation
            let filledWidth = 0.8 * chunkWidth; // For label and the checkbox
            let spaceWidth = chunkWidth - filledWidth;
            let contentWidth = filledWidth / 2; // For each label or checkbox
            let contentStyle = {
                width: `${contentWidth}%`
            };
            let spaceStyle = {
                width: `${spaceWidth}%`
            };
            return (
                <React.Fragment>
                    <tr>
                        <th colSpan={4}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={this.selectAllTranslations}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={this.selectNoneTranslation}
                            >
                                Select None
                            </button>
                            {this.props.suggestedFmcTranslations != null && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={this.selectSuggestedTranslations}
                                    title="This selection is based on competitor's nationalities."
                                >
                                    Select Suggested
                                </button>
                            )}
                        </th>
                    </tr>

                    <tr>
                        <th colSpan={4} className="text-center">
                            <table className="table table-hover">
                                <tbody>
                                    {translations.map(
                                        (translationsChunk, i) => (
                                            <tr key={i}>
                                                {translationsChunk.map(
                                                    (translation, j) => (
                                                        <React.Fragment key={j}>
                                                            <th
                                                                style={
                                                                    contentStyle
                                                                }
                                                            >
                                                                <label>
                                                                    {
                                                                        translation.id
                                                                    }
                                                                </label>
                                                            </th>
                                                            <th
                                                                style={
                                                                    contentStyle
                                                                }
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        translation.status
                                                                    }
                                                                    onChange={_ =>
                                                                        this.handleTranslation(
                                                                            translation.id
                                                                        )
                                                                    }
                                                                />
                                                            </th>
                                                            {j <
                                                                this.state
                                                                    .translationsPerLine -
                                                                    1 && (
                                                                <th
                                                                    style={
                                                                        spaceStyle
                                                                    }
                                                                />
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </th>
                    </tr>
                </React.Fragment>
            );
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
                        let copies = rounds[i].extensions.find(
                            extension => extension.id === copiesExtensionId
                        ).data.numCopies;
                        return (
                            <tr key={i} className="form-group">
                                <th scope="row" className="align-middle">
                                    {i + 1}
                                </th>
                                <td className="align-middle">
                                    <select
                                        value={rounds[i].format}
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
                                        value={copies}
                                        onChange={evt =>
                                            this.handleNumberOfCopiesChange(
                                                i,
                                                Number(evt.target.value),
                                                rounds
                                            )
                                        }
                                        min={1}
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

            let disabled = this.props.editingDisabled;

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
                                    disabled={disabled ? "disabled" : ""}
                                />
                            </th>
                        </tr>
                        {this.maybeShowTableTitles(rounds)}
                    </thead>
                    {this.maybeShowTableBody(event, rounds)}
                    {this.maybeShowMbld(rounds)}
                    {this.maybeShowFmcTranslations(rounds.length)}
                </table>
            );
        }
    }
);

export default EventPicker;

import React from "react";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import { updateWcaEvent, updateFileZipBlob } from "../redux/ActionCreators";
import {
    getDefaultCopiesExtension,
    copiesExtensionId,
} from "../helper/wcif.helper";
import MbldDetail from "./MbldDetail";
import FmcTranslationsDetail from "./FmcTranslationsDetail";
import "./EventPicker.css";
import { ProgressBar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

const EventPicker = ({ event, wcifEvent }) => {
    const wcaFormats = useSelector((state) => state.wcaFormats);
    const editingDisabled = useSelector((state) => state.editingDisabled);
    const generatingScrambles = useSelector(
        (state) => state.generatingScrambles
    );
    const scramblingProgressCurrent = useSelector(
        (state) => state.scramblingProgressCurrent
    );
    const scramblingProgressTarget = useSelector(
        (state) => state.scramblingProgressTarget
    );

    const dispatch = useDispatch();

    const updateEvent = (rounds) => {
        let wcaEvent = { id: event.id, rounds };
        dispatch(updateFileZipBlob(null));
        dispatch(updateWcaEvent(wcaEvent));
    };

    const handleNumberOfRoundsChange = (numberOfRounds, rounds) => {
        // Ajust the number of rounds in case we have to remove
        while (rounds.length > numberOfRounds) {
            rounds.pop();
        }

        // case we have to add
        while (rounds.length < numberOfRounds) {
            rounds.push({
                id: event.id + "-r" + (rounds.length + 1),
                format: event.format_ids[0],
                scrambleSetCount: 1,
                extensions: [getDefaultCopiesExtension()],
            });
        }
        updateEvent(rounds);
    };

    const handleGeneralRoundChange = (round, value, rounds, name) => {
        rounds[round][name] = value;
        updateEvent(rounds);
    };

    const handleNumberOfCopiesChange = (round, value, rounds) => {
        rounds[round].extensions.find(
            (extension) => extension.id === copiesExtensionId
        ).data.numCopies = value;
        updateEvent(rounds);
    };

    const abbreviate = (str) =>
        !!wcaFormats ? wcaFormats[str].shortName : "-";

    const maybeShowTableTitles = (rounds) => {
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

    const maybeShowTableBody = (rounds) => {
        if (rounds.length === 0) {
            return;
        }

        return (
            <tbody>
                {Array.from({ length: rounds.length }, (_, i) => {
                    let copies = rounds[i].extensions.find(
                        (extension) => extension.id === copiesExtensionId
                    ).data.numCopies;
                    return (
                        <tr key={i} className="form-group">
                            <th scope="row" className="align-middle">
                                {i + 1}
                            </th>
                            <td className="align-middle">
                                <select
                                    className="form-control"
                                    value={rounds[i].format}
                                    onChange={(evt) =>
                                        handleGeneralRoundChange(
                                            i,
                                            evt.target.value,
                                            rounds,
                                            "format"
                                        )
                                    }
                                    disabled={
                                        editingDisabled || generatingScrambles
                                    }
                                >
                                    {event.format_ids.map((format) => (
                                        <option key={format} value={format}>
                                            {abbreviate(format)}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={rounds[i].scrambleSetCount}
                                    onChange={(evt) =>
                                        handleGeneralRoundChange(
                                            i,
                                            evt.target.value,
                                            rounds,
                                            "scrambleSetCount"
                                        )
                                    }
                                    min={1}
                                    required
                                    disabled={
                                        editingDisabled || generatingScrambles
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={copies}
                                    onChange={(evt) =>
                                        handleNumberOfCopiesChange(
                                            i,
                                            evt.target.value,
                                            rounds
                                        )
                                    }
                                    min={1}
                                    required
                                    disabled={generatingScrambles}
                                />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        );
    };

    const maybeShowProgressBar = (rounds) => {
        let eventId = event.id;

        let current = scramblingProgressCurrent[eventId] || 0;
        let target = scramblingProgressTarget[eventId];

        if (rounds.length === 0 || !generatingScrambles || !target) {
            return;
        }

        let progress = (current / target) * 100;
        let miniThreshold = 2;

        if (progress === 0) {
            progress = miniThreshold;
        }

        return (
            <ProgressBar
                animated
                variant={progress === 100 ? "success" : "info"}
                now={progress}
                label={
                    progress === 100 || progress < miniThreshold
                        ? ""
                        : `${current} / ${target}`
                }
            />
        );
    };

    let rounds = !!wcifEvent ? wcifEvent.rounds : [];

    return (
        <table className="table table-sm shadow rounded">
            <thead>
                <tr
                    className={
                        rounds.length === 0
                            ? "thead-dark text-white"
                            : "thead-light"
                    }
                >
                    <th className="firstColumn" scope="col"></th>
                    <th scope="col" className="align-middle secondColumn">
                        <img
                            className="img-thumbnail cubingIcon"
                            src={require(`../assets/cubing-icon/${event.id}.svg`)}
                            alt={event.name}
                        />
                    </th>
                    <th className="align-middle lastTwoColumns" scope="col">
                        <h5 className="font-weight-bold">{event.name}</h5>
                        {maybeShowProgressBar(rounds)}
                    </th>
                    <th className="lastTwoColumns" scope="col">
                        <label>Rounds</label>
                        <select
                            className="form-control"
                            value={rounds.length}
                            onChange={(evt) =>
                                handleNumberOfRoundsChange(
                                    evt.target.value,
                                    rounds
                                )
                            }
                            disabled={editingDisabled || generatingScrambles}
                        >
                            {Array.from(
                                { length: MAX_WCA_ROUNDS + 1 },
                                (_, i) => (
                                    <option key={i} value={i}>
                                        {i}
                                    </option>
                                )
                            )}
                        </select>
                    </th>
                </tr>
                {maybeShowTableTitles(rounds)}
            </thead>
            {maybeShowTableBody(rounds)}
            {event.is_multiple_blindfolded && rounds.length > 0 && (
                <MbldDetail />
            )}
            {event.is_fewest_moves && rounds.length > 0 && (
                <FmcTranslationsDetail />
            )}
        </table>
    );
};

export default EventPicker;

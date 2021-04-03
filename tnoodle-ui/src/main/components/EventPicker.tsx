import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import RootState from "../model/RootState";
import Round from "../model/Round";
import WcaEvent from "../model/WcaEvent";
import WcifEvent from "../model/WcifEvent";
import { updateFileZipBlob, updateWcaEvent } from "../redux/ActionCreators";
import {
    copiesExtensionId,
    getDefaultCopiesExtension,
} from "../util/wcif.util";
import "./EventPicker.css";
import FmcTranslationsDetail from "./FmcTranslationsDetail";
import MbldDetail from "./MbldDetail";

interface EventPickerProps {
    wcaEvent: WcaEvent;
    wcifEvent?: WcifEvent;
}

const EventPicker = ({ wcaEvent, wcifEvent }: EventPickerProps) => {
    const wcaFormats = useSelector((state: RootState) => state.wcaFormats);
    const editingDisabled = useSelector(
        (state: RootState) => state.editingDisabled
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.generatingScrambles
    );
    const scramblingProgressCurrent = useSelector(
        (state: RootState) => state.scramblingProgressCurrent
    );
    const scramblingProgressTarget = useSelector(
        (state: RootState) => state.scramblingProgressTarget
    );

    const dispatch = useDispatch();

    const updateEvent = (rounds: Round[]) => {
        let event = { id: wcaEvent.id, rounds };
        dispatch(updateFileZipBlob());
        dispatch(updateWcaEvent(event));
    };
    const [image, setImage] = useState();

    useEffect(() => {
        import(`../assets/cubing-icon/${wcaEvent.id}.svg`).then((response) =>
            setImage(response.default)
        );
    }, [wcaEvent.id]);

    const handleNumberOfRoundsChange = (
        numberOfRounds: number,
        rounds: Round[]
    ) => {
        // Ajust the number of rounds in case we have to remove
        while (rounds.length > numberOfRounds) {
            rounds.pop();
        }

        // case we have to add
        while (rounds.length < numberOfRounds) {
            rounds.push({
                id: wcaEvent.id + "-r" + (rounds.length + 1),
                format: wcaEvent.format_ids[0],
                scrambleSetCount: "1",
                extensions: [getDefaultCopiesExtension()],
            });
        }
        updateEvent(rounds);
    };

    const handleGeneralRoundChange = (
        round: number,
        value: string,
        rounds: Round[],
        name: "format" | "scrambleSetCount"
    ) => {
        rounds[round][name] = value;
        updateEvent(rounds);
    };

    const handleNumberOfCopiesChange = (
        round: number,
        value: any,
        rounds: Round[]
    ) => {
        let data = rounds[round].extensions.find(
            (extension) => extension.id === copiesExtensionId
        )?.data;
        if (!!data) {
            data.numCopies = value;
        }
        updateEvent(rounds);
    };

    const abbreviate = (str: string) =>
        !!wcaFormats ? wcaFormats[str].shortName : "-";

    const maybeShowTableTitles = (rounds: Round[]) => {
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

    const maybeShowTableBody = (rounds: Round[]) => {
        if (rounds.length === 0) {
            return;
        }

        return (
            <tbody>
                {Array.from({ length: rounds.length }, (_, i) => {
                    let copies = rounds[i].extensions.find(
                        (extension) => extension.id === copiesExtensionId
                    )?.data.numCopies;
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
                                    {wcaEvent.format_ids.map((format) => (
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

    const maybeShowProgressBar = (rounds: Round[]) => {
        let eventId = wcaEvent.id;

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

    let rounds = wcifEvent?.rounds || [];

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
                            src={image}
                            alt={wcaEvent.name}
                        />
                    </th>
                    <th className="align-middle lastTwoColumns" scope="col">
                        <h5 className="font-weight-bold">{wcaEvent.name}</h5>
                        {maybeShowProgressBar(rounds)}
                    </th>
                    <th className="lastTwoColumns" scope="col">
                        <label>Rounds</label>
                        <select
                            className="form-control"
                            value={rounds.length}
                            onChange={(evt) =>
                                handleNumberOfRoundsChange(
                                    Number(evt.target.value),
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
            {wcaEvent.is_multiple_blindfolded && rounds.length > 0 && (
                <MbldDetail />
            )}
            {wcaEvent.is_fewest_moves && rounds.length > 0 && (
                <FmcTranslationsDetail />
            )}
        </table>
    );
};

export default EventPicker;

import { OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import RootState from "../model/RootState";
import Round from "../model/Round";
import WcaEvent from "../model/WcaEvent";
import WcifEvent from "../model/WcifEvent";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import { setWcaEvent } from "../redux/slice/WcifSlice";
import {
    copiesExtensionId,
    getDefaultCopiesExtension,
} from "../util/wcif.util";
import tnoodleApi from "../api/tnoodle.api";
import "./EventPicker.css";
import FmcTranslationsDetail from "./FmcTranslationsDetail";
import MbldDetail from "./MbldDetail";
import "@cubing/icons";
import { useCallback, useEffect, useState } from "react";
import SVG from "react-inlinesvg";
import SchemeColorPicker from "./SchemeColorPicker";
import ScrambleAndImage from "../model/ScrambleAndImage";

interface EventPickerProps {
    wcaEvent: WcaEvent;
    wcifEvent?: WcifEvent;
}

const EventPicker = ({ wcaEvent, wcifEvent }: EventPickerProps) => {
    const wcaFormats = useSelector(
        (state: RootState) => state.wcifSlice.wcaFormats
    );
    const editingStatus = useSelector(
        (state: RootState) => state.wcifSlice.editingStatus
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );
    const scramblingProgressCurrent = useSelector(
        (state: RootState) => state.scramblingSlice.scramblingProgressCurrent
    );
    const scramblingProgressTarget = useSelector(
        (state: RootState) => state.scramblingSlice.scramblingProgressTarget
    );

    const [puzzleSvg, setPuzzleSvg] = useState<string>();

    const [colorScheme, setColorScheme] = useState<Record<string, string>>();
    const [defaultColorScheme, setDefaultColorScheme] =
        useState<Record<string, string>>();

    const [displayScramble, setDisplayScramble] = useState<ScrambleAndImage>();

    useEffect(() => {
        let wcifRounds = wcifEvent?.rounds || [];

        if (wcifRounds.length > 0) {
            if (puzzleSvg === undefined) {
                tnoodleApi
                    .fetchSolvedPuzzleSvg(wcaEvent.id)
                    .then((response) => {
                        setPuzzleSvg(response.data);
                    });
            }

            if (colorScheme === undefined) {
                tnoodleApi
                    .fetchPuzzleColorScheme(wcaEvent.id)
                    .then((response) => {
                        setColorScheme(response.data);
                        setDefaultColorScheme(response.data);
                    });
            }
        }
    }, [wcaEvent, wcifEvent, puzzleSvg, colorScheme]);

    const fetchDisplayScramble = useCallback(
        (fetchNewScramble = true) => {
            // we need this additional boolean to make sure we can fetch only once
            // when the overlay is hidden, because its callback yields a `show` boolean.
            if (fetchNewScramble) {
                tnoodleApi
                    .fetchPuzzleRandomScramble(wcaEvent.id, colorScheme)
                    .then((response) => {
                        setDisplayScramble(response.data);
                    });
            }
        },
        [wcaEvent, colorScheme]
    );

    useEffect(() => {
        tnoodleApi
            .fetchSolvedPuzzleSvg(wcaEvent.id, colorScheme)
            .then((response) => {
                setPuzzleSvg(response.data);
            });

        fetchDisplayScramble();
    }, [wcaEvent, colorScheme, fetchDisplayScramble]);

    const [showColorSchemeConfig, setShowColorSchemeConfig] = useState(false);

    const dispatch = useDispatch();

    const updateEvent = (rounds: Round[]) => {
        let event = { id: wcaEvent.id, rounds };
        dispatch(setFileZip());
        dispatch(setWcaEvent(event));
    };

    const handleNumberOfRoundsChange = (
        numberOfRounds: number,
        rounds: Round[]
    ) => {
        let newRounds = [...rounds];
        // Ajust the number of rounds in case we have to remove
        while (newRounds.length > numberOfRounds) {
            newRounds.pop();
        }

        // case we have to add
        while (newRounds.length < numberOfRounds) {
            newRounds.push({
                id: wcaEvent.id + "-r" + (newRounds.length + 1),
                format: wcaEvent.format_ids[0],
                scrambleSetCount: "1",
                extensions: [getDefaultCopiesExtension()],
            });
        }
        updateEvent(newRounds);

        if (numberOfRounds === 0) {
            setShowColorSchemeConfig(false);
        }
    };

    const handleGeneralRoundChange = (
        roundNumber: number,
        value: string,
        rounds: Round[],
        name: "format" | "scrambleSetCount"
    ) => {
        updateEvent(
            rounds.map((round, i) =>
                i !== roundNumber ? round : { ...round, [name]: value }
            )
        );
    };

    const handleNumberOfCopiesChange = (
        roundNumber: number,
        numCopies: string,
        rounds: Round[]
    ) => {
        updateEvent(
            rounds.map((round, i) =>
                i !== roundNumber
                    ? round
                    : {
                          ...round,
                          extensions: round.extensions.map((extension) =>
                              extension.id === copiesExtensionId
                                  ? { ...extension, data: { numCopies } }
                                  : extension
                          ),
                      }
            )
        );
    };

    const handleColorSchemeChange = (colorKey: string, hexColor: string) => {
        let newColorScheme = {
            ...colorScheme,
            [colorKey]: hexColor,
        };

        setColorScheme(newColorScheme);
    };

    const abbreviate = (str: string) =>
        !!wcaFormats ? wcaFormats[str].shortName : "-";

    const maybeShowColorPicker = (rounds: Round[]) => {
        if (!showColorSchemeConfig || rounds.length === 0) {
            return;
        }

        if (colorScheme === undefined || defaultColorScheme === undefined) {
            return;
        }

        const defaultColors = Object.values(defaultColorScheme).filter(
            (key, i, arr) => arr.findIndex((t) => t === key) === i
        );

        return (
            <tr className="thead-light">
                <th scope="col" colSpan={4}>
                    <table className={"table table-borderless"}>
                        <tbody>
                            <tr>
                                {Object.keys(colorScheme).map((colorKey) => {
                                    return (
                                        <td key={colorKey}>
                                            <SchemeColorPicker
                                                defaultColors={defaultColors}
                                                colorKey={colorKey}
                                                colorValue={
                                                    colorScheme[colorKey]
                                                }
                                                onColorChange={(hexColor) =>
                                                    handleColorSchemeChange(
                                                        colorKey,
                                                        hexColor
                                                    )
                                                }
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td colSpan={defaultColors.length}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setColorScheme(defaultColorScheme)
                                        }
                                    >
                                        Reset to default
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </th>
            </tr>
        );
    };

    const maybeShowTableTitles = (rounds: Round[]) => {
        if (rounds.length === 0) {
            return;
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
                                        !editingStatus || generatingScrambles
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
                                        !editingStatus || generatingScrambles
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
                    <th className="firstColumn" scope="col" />
                    <th scope="col" className="align-middle secondColumn">
                        <span
                            className={`cubing-icon event-${wcaEvent.id}`}
                            title={wcaEvent.name}
                        />
                    </th>
                    <th className="align-middle lastTwoColumns" scope="col">
                        <h5 className="font-weight-bold">{wcaEvent.name}</h5>
                        {maybeShowProgressBar(rounds)}
                    </th>
                    <th className="lastTwoColumns" scope="col">
                        {rounds.length > 0 &&
                            puzzleSvg !== undefined &&
                            displayScramble !== undefined && (
                                <div className={"mb-2"}>
                                    <OverlayTrigger
                                        placement={"left"}
                                        onToggle={fetchDisplayScramble}
                                        overlay={
                                            <Tooltip className={"fit-content"}>
                                                <SVG
                                                    src={
                                                        displayScramble.svgImage
                                                    }
                                                    width={200}
                                                    height={200}
                                                />
                                                <p>
                                                    (click small preview to
                                                    edit)
                                                </p>
                                            </Tooltip>
                                        }
                                    >
                                        <SVG
                                            className={"lastTwoColumns"}
                                            src={puzzleSvg}
                                            height={50}
                                            onClick={() =>
                                                setShowColorSchemeConfig(
                                                    !showColorSchemeConfig
                                                )
                                            }
                                        />
                                    </OverlayTrigger>
                                </div>
                            )}
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
                            disabled={!editingStatus || generatingScrambles}
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
                {maybeShowColorPicker(rounds)}
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

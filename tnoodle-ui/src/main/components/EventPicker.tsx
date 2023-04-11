import { OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import RootState from "../model/RootState";
import Round from "../model/Round";
import WcaEvent from "../model/WcaEvent";
import WcifEvent from "../model/WcifEvent";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import { setWcifEvent } from "../redux/slice/WcifSlice";
import {
    colorSchemeExtensionId,
    copiesExtensionId,
    getDefaultCopiesExtension
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
import _ from "lodash";
import { useWriteEffect } from "../util/extension.util";

interface EventPickerProps {
    wcaEvent: WcaEvent;
    wcifEvent: WcifEvent;
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

    const [defaultColorScheme, setDefaultColorScheme] = useState<Record<string, string>>();
    const [colorScheme, setColorScheme] = useState<Record<string, string>>(
        wcifEvent.extensions.find(
            (it) => it.id === colorSchemeExtensionId
        )?.data?.colorScheme ?? undefined
    );

    const [randomSampleScramble, setRandomSampleScramble] = useState<ScrambleAndImage>();

    const [showColorSchemeConfig, setShowColorSchemeConfig] = useState<boolean>(false);

    const fetchDisplayScramble = useCallback(
        (fetchNewScramble = true) => {
            // we need this additional boolean to make sure we can fetch only once
            // when the overlay is hidden, because its callback yields a `show` boolean.
            if (fetchNewScramble && colorScheme !== undefined) {
                tnoodleApi
                    .fetchPuzzleRandomScramble(wcaEvent.id, colorScheme)
                    .then((response) => {
                        setRandomSampleScramble(response.data);
                    });
            }
        }, [wcaEvent.id, colorScheme]
    );

    useEffect(() => {
        if (colorScheme !== undefined) {
            tnoodleApi
                .fetchSolvedPuzzleSvg(wcaEvent.id, colorScheme)
                .then((response) => {
                    setPuzzleSvg(response.data);
                });

            fetchDisplayScramble();
        }
    }, [wcaEvent.id, colorScheme, fetchDisplayScramble]);

    const dispatch = useDispatch();

    useEffect(() => {
        if (wcifEvent.rounds.length > 0) {
            if (colorScheme === undefined || defaultColorScheme === undefined) {
                tnoodleApi
                    .fetchPuzzleColorScheme(wcaEvent.id)
                    .then((response) => {
                        if (colorScheme === undefined) {
                            setColorScheme(response.data);
                        }

                        setDefaultColorScheme(response.data);
                    });
            }
        }
    }, [dispatch, wcaEvent.id, wcifEvent.rounds, colorScheme, defaultColorScheme]);

    const updateEventRounds = (rounds: Round[]) => {
        let event = {
            id: wcaEvent.id,
            rounds,
            extensions: wcifEvent.extensions
        };

        dispatch(setFileZip());
        dispatch(setWcifEvent(event));
    };

    const buildColorSchemeExtension = useCallback(
        () => {
            let isDefaultColorScheme = _.isEqual(colorScheme, defaultColorScheme);

            if (isDefaultColorScheme) {
                return null;
            }

            return {
                id: colorSchemeExtensionId,
                specUrl: '',
                data: { colorScheme }
            };
        }, [colorScheme, defaultColorScheme]
    );

    useWriteEffect(
        wcifEvent,
        colorSchemeExtensionId,
        dispatch,
        setWcifEvent,
        buildColorSchemeExtension,
    );

    useEffect(() => { dispatch(setFileZip()) }, [dispatch, buildColorSchemeExtension]);

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
        updateEventRounds(newRounds);

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
        updateEventRounds(
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
        updateEventRounds(
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

    const maybeShowColorPicker = () => {
        if (!showColorSchemeConfig || wcifEvent.rounds.length === 0) {
            return;
        }

        if (colorScheme === undefined || defaultColorScheme === undefined) {
            return;
        }

        const defaultColors = _.uniq(Object.values(defaultColorScheme));

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
                                        onClick={() => setColorScheme(defaultColorScheme)}
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

    const maybeShowTableTitles = () => {
        if (wcifEvent.rounds.length === 0) {
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

    const maybeShowTableBody = () => {
        if (wcifEvent.rounds.length === 0) {
            return;
        }

        let wcifRounds = wcifEvent.rounds;

        return (
            <tbody>
                {Array.from({ length: wcifRounds.length }, (_, i) => {
                    let copies = wcifRounds[i].extensions.find(
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
                                    value={wcifRounds[i].format}
                                    onChange={(evt) =>
                                        handleGeneralRoundChange(
                                            i,
                                            evt.target.value,
                                            wcifRounds,
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
                                    value={wcifRounds[i].scrambleSetCount}
                                    onChange={(evt) =>
                                        handleGeneralRoundChange(
                                            i,
                                            evt.target.value,
                                            wcifRounds,
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
                                            wcifRounds
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

    const maybeShowProgressBar = () => {
        let target = scramblingProgressTarget[wcaEvent.id];

        if (wcifEvent.rounds.length === 0 || !generatingScrambles || !target) {
            return null;
        }

        let current = scramblingProgressCurrent[wcaEvent.id] || 0;

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

    return (
        <table className="table table-sm shadow rounded">
            <thead>
                <tr
                    className={
                        wcifEvent.rounds.length === 0
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
                        {maybeShowProgressBar()}
                    </th>
                    <th className="lastTwoColumns" scope="col">
                        {wcifEvent.rounds.length > 0 &&
                            puzzleSvg !== undefined &&
                            randomSampleScramble !== undefined && (
                                <div className={"mb-2"}>
                                    <OverlayTrigger
                                        placement={"left"}
                                        onToggle={fetchDisplayScramble}
                                        overlay={
                                            <Tooltip className={"fit-content"}>
                                                <SVG
                                                    src={
                                                        randomSampleScramble.svgImage
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
                            value={wcifEvent.rounds.length}
                            onChange={(evt) =>
                                handleNumberOfRoundsChange(
                                    Number(evt.target.value),
                                    wcifEvent.rounds
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
                {maybeShowColorPicker()}
                {maybeShowTableTitles()}
            </thead>
            {maybeShowTableBody()}
            {wcaEvent.is_multiple_blindfolded && wcifEvent.rounds.length > 0 && (
                <MbldDetail mbldWcifEvent={wcifEvent} />
            )}
            {wcaEvent.is_fewest_moves && wcifEvent.rounds.length > 0 && (
                <FmcTranslationsDetail fmcWcifEvent={wcifEvent} />
            )}
        </table>
    );
};

export default EventPicker;

import { chunk } from "lodash";
import React, {useCallback, useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../model/RootState";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import "./FmcTranslationsDetail.css";
import tnoodleApi from "../api/tnoodle.api";
import WcifEvent from "../model/WcifEvent";
import { fmcTranslationsExtensionId } from "../util/wcif.util";
import { setWcifEvent } from "../redux/slice/WcifSlice";
import {
    findAndProcessExtension,
    findExtension,
    setExtensionLazily,
} from "../util/extension.util";

const TRANSLATIONS_PER_LINE = 3;

interface FmcTranslationsDetailProps {
    fmcWcifEvent: WcifEvent;
}

const FmcTranslationsDetail = ({
    fmcWcifEvent,
}: FmcTranslationsDetailProps) => {
    const suggestedFmcTranslations = useSelector(
        (state: RootState) => state.eventDataSlice.suggestedFmcTranslations
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const [availableTranslations, setAvailableTranslations] =
        useState<Record<string, string>>();
    const [selectedTranslations, setSelectedTranslations] = useState<string[]>(
        []
    );

    const [showTranslations, setShowTranslations] = useState(false);

    useEffect(() => {
        findAndProcessExtension(
            fmcWcifEvent,
            fmcTranslationsExtensionId,
            (ext) => {
                setSelectedTranslations(ext.data.languageTags);
            }
        );
    }, [fmcWcifEvent]);

    useEffect(() => {
        if (availableTranslations === undefined) {
            tnoodleApi.fetchAvailableFmcTranslations().then((response) => {
                setAvailableTranslations(response.data);
            });
        }
    }, [availableTranslations]);

    const dispatch = useDispatch();

    const buildFmcExtension = (selectedTranslations: string[]) => {
        if (selectedTranslations.length === 0) {
            return null;
        }

        return {
            id: fmcTranslationsExtensionId,
            specUrl: "",
            data: { languageTags: selectedTranslations },
        };
    };

    const updateEventSelectedTranslations = useCallback(
        (
            selectedTranslations: string[]
        ) => {
            setExtensionLazily(
                fmcWcifEvent,
                fmcTranslationsExtensionId,
                () => buildFmcExtension(selectedTranslations),
                (fmcWcifEvent) => {
                    dispatch(setWcifEvent(fmcWcifEvent));
                    dispatch(setFileZip());
                }
            );
        }, [dispatch, fmcWcifEvent]
    );

    useEffect(() => {
        const existingExtensionFmc = findExtension(fmcWcifEvent, fmcTranslationsExtensionId);

        if (existingExtensionFmc === undefined && suggestedFmcTranslations !== undefined) {
            updateEventSelectedTranslations(suggestedFmcTranslations);
        }
    }, [fmcWcifEvent, updateEventSelectedTranslations, suggestedFmcTranslations]);

    const handleTranslation = (id: string, status: boolean) => {
        let newSelectedTranslations = selectedTranslations.filter(
            (it) => it !== id || status
        );

        if (status && !newSelectedTranslations.includes(id)) {
            newSelectedTranslations.push(id);
        }

        updateEventSelectedTranslations(newSelectedTranslations);
    };

    const handleSelectAllTranslations = () => {
        if (availableTranslations === undefined) {
            selectNoneTranslation();
        } else {
            updateEventSelectedTranslations(Object.keys(availableTranslations));
        }
    };

    const selectNoneTranslation = () => {
        updateEventSelectedTranslations([]);
    };

    const selectSuggestedTranslations = () => {
        updateEventSelectedTranslations(suggestedFmcTranslations || []);
    };

    const translationsDetail = () => {
        if (availableTranslations === undefined) {
            return;
        }

        let availableTranslationKeys = Object.keys(availableTranslations);

        let translationsChunks = chunk(
            availableTranslationKeys,
            TRANSLATIONS_PER_LINE
        );

        return translationsChunks.map((translationsChunk, i) => (
            <tr key={i}>
                {translationsChunk.map((translation, j) => {
                    let checkboxId = `fmc-${translation}`;
                    let translationStatus =
                        selectedTranslations.includes(translation);

                    return (
                        <React.Fragment key={j}>
                            <th>
                                <label
                                    className="fmc-label"
                                    htmlFor={checkboxId}
                                >
                                    {availableTranslations[translation]}
                                </label>
                            </th>
                            <th>
                                <input
                                    disabled={generatingScrambles}
                                    type="checkbox"
                                    id={checkboxId}
                                    checked={translationStatus}
                                    onChange={(e) =>
                                        handleTranslation(
                                            translation,
                                            e.target.checked
                                        )
                                    }
                                />
                            </th>
                            {j < TRANSLATIONS_PER_LINE - 1 && <th />}
                        </React.Fragment>
                    );
                })}
            </tr>
        ));
    };

    return (
        <tfoot>
            <tr>
                <th colSpan={4} className="text-center">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowTranslations(!showTranslations)}
                        disabled={generatingScrambles}
                    >
                        Translations
                    </button>
                </th>
            </tr>
            {showTranslations && (
                <>
                    <tr>
                        <th colSpan={4}>
                            <div className="btn-group">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSelectAllTranslations}
                                    disabled={generatingScrambles}
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={selectNoneTranslation}
                                    disabled={generatingScrambles}
                                >
                                    Select None
                                </button>
                                {!!suggestedFmcTranslations && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={selectSuggestedTranslations}
                                        title="This selection is based on competitor's nationalities."
                                        disabled={generatingScrambles}
                                    >
                                        Select Suggested
                                    </button>
                                )}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={4} className="text-center">
                            <table className="table table-hover">
                                <tbody>{translationsDetail()}</tbody>
                            </table>
                        </th>
                    </tr>
                </>
            )}
        </tfoot>
    );
};

export default FmcTranslationsDetail;

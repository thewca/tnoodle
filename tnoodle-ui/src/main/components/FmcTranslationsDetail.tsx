import { chunk } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../model/RootState";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import "./FmcTranslationsDetail.css";
import tnoodleApi from "../api/tnoodle.api";
import WcifEvent from "../model/WcifEvent";
import { fmcTranslationsExtensionId } from "../util/wcif.util";
import { setWcifEvent } from "../redux/slice/WcifSlice";
import { findExtension, setExtensionLazily } from "../util/extension.util";

const TRANSLATIONS_PER_LINE = 3;

interface FmcTranslationsDetailProps {
    fmcWcifEvent: WcifEvent;
}

const FmcTranslationsDetail = ({ fmcWcifEvent } : FmcTranslationsDetailProps) => {
    const suggestedFmcTranslations = useSelector(
        (state: RootState) => state.eventDataSlice.suggestedFmcTranslations
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const [availableTranslations, setAvailableTranslations] = useState<Record<string, string>>({});
    const [selectedTranslations, setSelectedTranslations] = useState<string[]>([]);

    const [showTranslations, setShowTranslations] = useState(false);

    useEffect(() => {
        let fmcTranslationsExtension = findExtension(fmcWcifEvent, fmcTranslationsExtensionId);

        if (fmcTranslationsExtension !== undefined) {
            setSelectedTranslations(fmcTranslationsExtension.data.languageTags);
        } else if (availableTranslations !== undefined) {
            setSelectedTranslations(Object.keys(availableTranslations));
        }
    }, [fmcWcifEvent, availableTranslations]);

    const dispatch = useDispatch();

    useEffect(
        () => {
            if (Object.entries(availableTranslations).length === 0) {
                tnoodleApi.fetchAvailableFmcTranslations().then((response) => {
                    setAvailableTranslations(response.data);
                    setSelectedTranslations(Object.keys(response.data));
                });
            }
        }, [dispatch, availableTranslations]
    );

    const buildFmcExtension = (selectedTranslations: string[]) => {
        return {
            id: fmcTranslationsExtensionId,
            specUrl: '',
            data: { languageTags: selectedTranslations }
        }
    };

    const updateEventSelectedTranslations = (selectedTranslations: string[]) => {
        setExtensionLazily(fmcWcifEvent, fmcTranslationsExtensionId, () => {
            return buildFmcExtension(selectedTranslations);
        }, (fmcWcifEvent) => {
            dispatch(setWcifEvent(fmcWcifEvent));
            dispatch(setFileZip());
        })
    };

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
        updateEventSelectedTranslations(Object.keys(availableTranslations));
    };

    const selectNoneTranslation = () => {
        updateEventSelectedTranslations([]);
    };

    const selectSuggestedTranslations = () => {
        updateEventSelectedTranslations(suggestedFmcTranslations || []);
    };

    const translationsDetail = () => {
        let availableTranslationKeys = Object.keys(availableTranslations);
        let translationsChunks = chunk(availableTranslationKeys, TRANSLATIONS_PER_LINE);

        return translationsChunks.map((translationsChunk, i) => (
            <tr key={i}>
                {translationsChunk.map((translation, j) => {
                    let checkboxId = `fmc-${translation}`;
                    let translationStatus = selectedTranslations.includes(translation)

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

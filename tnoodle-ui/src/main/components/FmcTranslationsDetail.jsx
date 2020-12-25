import React, { useState } from "react";
import _ from "lodash";
import {
    updateFileZipBlob,
    updateTranslation,
    selectAllTranslations,
    resetTranslations,
    setSuggestedFmcTranslations,
} from "../redux/ActionCreators";
import "./FmcTranslationsDetail.css";
import { useDispatch, useSelector } from "react-redux";

const TRANSLATIONS_PER_LINE = 3;

const FmcTranslationsDetail = () => {
    const [showTranslations, setShowTranslations] = useState(false);

    const suggestedFmcTranslations = useSelector(
        (state) => state.suggestedFmcTranslations
    );
    const translations = useSelector((state) => state.translations);
    const generatingScrambles = useSelector(
        (state) => state.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleTranslation = (id, status) => {
        dispatch(updateFileZipBlob(null));
        dispatch(updateTranslation(id, status));
    };

    const handleSelectAllTranslations = () => {
        dispatch(updateFileZipBlob(null));
        dispatch(selectAllTranslations());
    };

    const selectNoneTranslation = () => {
        dispatch(updateFileZipBlob(null));
        dispatch(resetTranslations());
    };

    const selectSuggestedTranslations = () => {
        dispatch(updateFileZipBlob(null));
        dispatch(setSuggestedFmcTranslations(suggestedFmcTranslations));
    };

    const translationsDetail = () => {
        let translationsChunks = _.chunk(translations, TRANSLATIONS_PER_LINE);
        return translationsChunks.map((translationsChunk, i) => (
            <tr key={i}>
                {translationsChunk.map((translation, j) => {
                    let checkboxId = `fmc-${translation.id}`;
                    return (
                        <React.Fragment key={j}>
                            <th>
                                <label
                                    className="fmc-label"
                                    htmlFor={checkboxId}
                                >
                                    {translation.display}
                                </label>
                            </th>
                            <th>
                                <input
                                    disabled={generatingScrambles}
                                    type="checkbox"
                                    id={checkboxId}
                                    checked={translation.status}
                                    onChange={(e) =>
                                        handleTranslation(
                                            translation.id,
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

    if (!translations) {
        return null;
    }
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

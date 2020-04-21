import { ActionTypes } from "./Types";

export const updateMe = (me) => ({
    type: ActionTypes.UPDATE_ME,
    payload: { me },
});

export const updateEvents = (events) => ({
    type: ActionTypes.UPDATE_EVENTS,
    payload: { events },
});

export const updatePassword = (password) => ({
    type: ActionTypes.UPDATE_PASSWORD,
    payload: { password },
});

export const updateCompetitionName = (competitionName) => ({
    type: ActionTypes.UPDATE_COMPETITION_NAME,
    payload: { competitionName },
});

export const updateWcaEvent = (wcaEvent) => ({
    type: ActionTypes.UPDATE_WCA_EVENT,
    payload: { wcaEvent },
});

export const updateMbld = (mbld) => ({
    type: ActionTypes.UPDATE_MBLD,
    payload: { mbld },
});

export const updateCompetitions = (competitions) => ({
    type: ActionTypes.UPDATE_COMPETITIONS,
    payload: { competitions },
});

export const updateWcif = (wcif) => ({
    type: ActionTypes.UPDATE_WCIF,
    payload: { wcif },
});

export const updateEditingStatus = (flag) => ({
    type: ActionTypes.UPDATE_EDITING_STATUS,
    payload: { editingDisabled: flag },
});

export const updateCompetitionId = (competitionId) => ({
    type: ActionTypes.UPDATE_COMPETITION_ID,
    payload: { competitionId },
});

export const updateOfficialZipStatus = (flag) => ({
    type: ActionTypes.UPDATE_OFFICIAL_ZIP_STATUS,
    payload: { officialZip: flag },
});

/**
 * When user change some event, we reset blob.
 * If the user generate a scramble and then change some event,
 * this allow generating other set of scrambles.
 */
export const updateFileZipBlob = (fileZipBlob) => ({
    type: ActionTypes.UPDATE_FILE_ZIP_BLOB,
    payload: { fileZipBlob: fileZipBlob },
});

/**
 * @param {string} competitionId Since we cache information considering competitions, use id like WC2015.
 * @param {string} identifier WCIF or suggestedFmcLanguages
 * @param {json} object
 */
export const addCachedObject = (competitionId, identifier, object) => ({
    type: ActionTypes.ADD_CACHED_OBJECT,
    payload: { competitionId, identifier, object },
});

export const updateTranslations = (translations) => ({
    type: ActionTypes.UPDATE_TRANSLATIONS,
    payload: { translations },
});

export const updateTranslation = (id) => ({
    type: ActionTypes.UPDATE_TRANSLATION,
    payload: { id },
});

export const resetTranslations = () => ({
    type: ActionTypes.RESET_TRANSLATIONS,
    payload: {},
});

export const selectAllTranslations = () => ({
    type: ActionTypes.SELECT_ALL_TRANSLATIONS,
    payload: {},
});

/**
 * Stores the suggestedFmcTranslations
 * @param {array} suggestedFmcTranslations
 */
export const addSuggestedFmcTranslations = (suggestedFmcTranslations) => ({
    type: ActionTypes.ADD_SUGGESTED_FMC_TRANSLATIONS,
    payload: { suggestedFmcTranslations },
});

/**
 * Given an array of languages and a previous array of FMC languages,
 * set as selected FMC language only those present on the first array.
 * @param {array} suggestedFmcTranslations
 */
export const setSuggestedFmcTranslations = (suggestedFmcTranslations) => ({
    type: ActionTypes.SET_SUGGESTED_FMC_TRANSLATIONS,
    payload: { suggestedFmcTranslations },
});

export const setBestMbldAttempt = (bestMbldAttempt) => ({
    type: ActionTypes.SET_BEST_MBLD_ATTEMPT,
    payload: { bestMbldAttempt },
});

export const setWcaFormats = (wcaFormats) => ({
    type: ActionTypes.SET_WCA_FORMATS,
    payload: { wcaFormats },
});

export const setWcaEvents = (wcaEvents) => ({
    type: ActionTypes.SET_WCA_EVENTS,
    payload: { wcaEvents },
});

export const updateFlashMessage = (text, bootstrapBackground) => ({
    type: ActionTypes.UPDATE_FLASH_MESSAGE,
    palyload: { text, bootstrapBackground },
});

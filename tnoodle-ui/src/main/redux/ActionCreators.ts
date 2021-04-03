import Competition from "../model/Competition";
import Person from "../model/Person";
import Translation from "../model/Translation";
import WcaEvent from "../model/WcaEvent";
import WcaFormat from "../model/WcaFormat";
import Wcif from "../model/Wcif";
import WcifEvent from "../model/WcifEvent";
import { ActionTypes } from "./Types";

export const updateMe = (me: Person) => ({
    type: ActionTypes.UPDATE_ME,
    payload: { me },
});

export const updateEvents = (events: WcaEvent[]) => ({
    type: ActionTypes.UPDATE_EVENTS,
    payload: { events },
});

export const updatePassword = (password: string) => ({
    type: ActionTypes.UPDATE_PASSWORD,
    payload: { password },
});

export const updateCompetitionName = (competitionName: string) => ({
    type: ActionTypes.UPDATE_COMPETITION_NAME,
    payload: { competitionName },
});

export const updateWcaEvent = (wcaEvent: WcifEvent) => ({
    type: ActionTypes.UPDATE_WCA_EVENT,
    payload: { wcaEvent },
});

export const updateMbld = (mbld: string) => ({
    type: ActionTypes.UPDATE_MBLD,
    payload: { mbld },
});

export const updateCompetitions = (competitions: Competition[]) => ({
    type: ActionTypes.UPDATE_COMPETITIONS,
    payload: { competitions },
});

export const updateWcif = (wcif: Wcif) => ({
    type: ActionTypes.UPDATE_WCIF,
    payload: { wcif },
});

/**
 * False means we can edit, that is, it's not disabled
 * @param {boolean} flag
 */
export const updateEditingStatus = (flag: boolean) => ({
    type: ActionTypes.UPDATE_EDITING_STATUS,
    payload: { editingDisabled: flag },
});

export const updateCompetitionId = (competitionId?: string) => ({
    type: ActionTypes.UPDATE_COMPETITION_ID,
    payload: { competitionId },
});

export const updateOfficialZipStatus = (flag: boolean) => ({
    type: ActionTypes.UPDATE_OFFICIAL_ZIP_STATUS,
    payload: { officialZip: flag },
});

/**
 * When user change some event, we reset blob.
 * If the user generate a scramble and then change some event,
 * this allow generating other set of scrambles.
 */
export const updateFileZipBlob = (fileZipBlob?: Blob) => ({
    type: ActionTypes.UPDATE_FILE_ZIP_BLOB,
    payload: { fileZipBlob },
});

export const updateGeneratingScrambles = (generatingScrambles: boolean) => ({
    type: ActionTypes.UPDATE_GENERATING_SCRAMBLES,
    payload: { generatingScrambles },
});

export const updateScramblingProgressTarget = (
    scramblingProgressTarget: Record<string, number>
) => ({
    type: ActionTypes.UPDATE_SCRAMBLING_PROGRESS_TARGET,
    payload: { scramblingProgressTarget },
});

export const updateScramblingProgressCurrentEvent = (eventId: string) => ({
    type: ActionTypes.UPDATE_SCRAMBLING_PROGRESS_CURRENT_EVENT,
    payload: { eventId },
});

export const resetScramblingProgressCurrent = () => ({
    type: ActionTypes.RESET_SCRAMBLING_PROGRESS_CURRENT,
    payload: {},
});

/**
 * @param {string} competitionId Since we cache information considering competitions, use id like WC2015.
 * @param {string} identifier WCIF or suggestedFmcLanguages
 * @param {json} object
 */
export const addCachedObject = (
    competitionId: string,
    identifier: string,
    object: any
) => ({
    type: ActionTypes.ADD_CACHED_OBJECT,
    payload: { competitionId, identifier, object },
});

export const updateTranslations = (translations: Translation[]) => ({
    type: ActionTypes.UPDATE_TRANSLATIONS,
    payload: { translations },
});

export const updateTranslation = (id: string, status: boolean) => ({
    type: ActionTypes.UPDATE_TRANSLATION,
    payload: { id, status },
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
export const addSuggestedFmcTranslations = (
    suggestedFmcTranslations?: string[]
) => ({
    type: ActionTypes.ADD_SUGGESTED_FMC_TRANSLATIONS,
    payload: { suggestedFmcTranslations },
});

/**
 * Given an array of languages and a previous array of FMC languages,
 * set as selected FMC language only those present on the first array.
 * @param {array} suggestedFmcTranslations
 */
export const setSuggestedFmcTranslations = (
    suggestedFmcTranslations?: string[]
) => ({
    type: ActionTypes.SET_SUGGESTED_FMC_TRANSLATIONS,
    payload: { suggestedFmcTranslations },
});

export const setBestMbldAttempt = (bestMbldAttempt?: number) => ({
    type: ActionTypes.SET_BEST_MBLD_ATTEMPT,
    payload: { bestMbldAttempt },
});

export const setWcaFormats = (wcaFormats: WcaFormat[]) => ({
    type: ActionTypes.SET_WCA_FORMATS,
    payload: { wcaFormats },
});

export const setWcaEvents = (wcaEvents: WcaEvent[]) => ({
    type: ActionTypes.SET_WCA_EVENTS,
    payload: { wcaEvents },
});

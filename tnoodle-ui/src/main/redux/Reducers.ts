import { MBLD_DEFAULT } from "../constants/wca.constants";
import RootState from "../model/RootState";
import Translation from "../model/Translation";
import WcifEvent from "../model/WcifEvent";
import { competitionName2Id } from "../util/competition.name.util";
import { defaultWcif, getDefaultCopiesExtension } from "../util/wcif.util";
import { ActionTypes } from "./Types";
import { AnyAction } from "redux";

const defaultStore: RootState = {
    bestMbldAttempt: undefined,
    cachedObjects: {},
    competitionId: undefined,
    competitions: undefined,
    editingDisabled: false, // If we fetch competition info, some fields can't be changed
    fileZipBlob: undefined,
    generatingScrambles: false,
    me: undefined,
    mbld: "" + MBLD_DEFAULT,
    officialZip: true,
    password: "",
    scramblingProgressCurrent: {},
    scramblingProgressTarget: {},
    suggestedFmcTranslations: undefined,
    translations: undefined,
    wcaEvents: undefined,
    wcaFormats: undefined,
    wcif: defaultWcif,
};

export const Reducer = (store: RootState, action: AnyAction) => {
    if (action.type === ActionTypes.UPDATE_ME) {
        return {
            ...store,
            me: action.payload.me,
        };
    }

    if (action.type === ActionTypes.UPDATE_EVENTS) {
        return {
            ...store,
            wcif: { ...store.wcif, events: action.payload.events },
        };
    }

    if (action.type === ActionTypes.UPDATE_PASSWORD) {
        return {
            ...store,
            password: action.payload.password,
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITION_NAME) {
        let competitionName = action.payload.competitionName;
        let id = competitionName2Id(competitionName);
        return {
            ...store,
            wcif: {
                ...store.wcif,
                name: competitionName,
                shortName: competitionName,
                id,
            },
        };
    }

    if (action.type === ActionTypes.UPDATE_WCA_EVENT) {
        return {
            ...store,
            wcif: {
                ...store.wcif,
                events: [
                    ...store.wcif.events.filter(
                        (wcaEvent) => wcaEvent.id !== action.payload.wcaEvent.id
                    ),
                    action.payload.wcaEvent,
                ],
            },
        };
    }

    if (action.type === ActionTypes.UPDATE_MBLD) {
        return {
            ...store,
            mbld: action.payload.mbld,
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITIONS) {
        return {
            ...store,
            competitions: action.payload.competitions,
        };
    }

    /**
     * Either sets or reset WCIF to default.
     */
    if (action.type === ActionTypes.UPDATE_WCIF) {
        let wcif = action.payload.wcif || defaultWcif;

        // Sets copies to 1 since it does not come from the website.
        wcif.events.forEach((event: WcifEvent) =>
            event.rounds.forEach((round) =>
                round.extensions.push(getDefaultCopiesExtension())
            )
        );
        return {
            ...store,
            wcif,
        };
    }

    if (action.type === ActionTypes.UPDATE_EDITING_STATUS) {
        return {
            ...store,
            editingDisabled: action.payload.editingDisabled,
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITION_ID) {
        return { ...store, competitionId: action.payload.competitionId };
    }

    if (action.type === ActionTypes.UPDATE_OFFICIAL_ZIP_STATUS) {
        return { ...store, officialZip: action.payload.officialZip };
    }

    if (action.type === ActionTypes.UPDATE_FILE_ZIP_BLOB) {
        return { ...store, fileZipBlob: action.payload.fileZipBlob };
    }

    if (action.type === ActionTypes.UPDATE_GENERATING_SCRAMBLES) {
        return {
            ...store,
            generatingScrambles: action.payload.generatingScrambles,
        };
    }

    if (action.type === ActionTypes.UPDATE_SCRAMBLING_PROGRESS_TARGET) {
        return {
            ...store,
            scramblingProgressTarget: action.payload.scramblingProgressTarget,
        };
    }

    if (action.type === ActionTypes.UPDATE_SCRAMBLING_PROGRESS_CURRENT_EVENT) {
        return {
            ...store,
            scramblingProgressCurrent: {
                ...store.scramblingProgressCurrent,
                [action.payload.eventId]:
                    (store.scramblingProgressCurrent[action.payload.eventId] ||
                        0) + 1,
            },
        };
    }

    if (action.type === ActionTypes.RESET_SCRAMBLING_PROGRESS_CURRENT) {
        return { ...store, scramblingProgressCurrent: {} };
    }

    if (action.type === ActionTypes.ADD_CACHED_OBJECT) {
        return {
            ...store,
            cachedObjects: {
                ...store.cachedObjects,
                [action.payload.competitionId]: {
                    ...store.cachedObjects[action.payload.competitionId],
                    [action.payload.identifier]: action.payload.object,
                },
            },
        };
    }

    if (action.type === ActionTypes.RESET_TRANSLATIONS) {
        return {
            ...store,
            translations: store.translations?.map(
                (translation: Translation) => ({
                    ...translation,
                    status: false,
                })
            ),
        };
    }

    if (action.type === ActionTypes.UPDATE_TRANSLATION) {
        return {
            ...store,
            translations: store.translations?.map((translation) => ({
                ...translation,
                status:
                    translation.id === action.payload.id
                        ? action.payload.status
                        : translation.status,
            })),
        };
    }

    if (action.type === ActionTypes.UPDATE_TRANSLATIONS) {
        return {
            ...store,
            translations: action.payload.translations,
        };
    }

    if (action.type === ActionTypes.SELECT_ALL_TRANSLATIONS) {
        return {
            ...store,
            translations: store.translations?.map((translation) => ({
                ...translation,
                status: true,
            })),
        };
    }

    if (action.type === ActionTypes.ADD_SUGGESTED_FMC_TRANSLATIONS) {
        return {
            ...store,
            suggestedFmcTranslations: action.payload.suggestedFmcTranslations,
        };
    }

    if (action.type === ActionTypes.SET_SUGGESTED_FMC_TRANSLATIONS) {
        let translations = store.translations?.map((translation) => ({
            ...translation,
            status: action.payload.suggestedFmcTranslations.includes(
                translation.id
            ),
        }));
        return {
            ...store,
            translations,
        };
    }

    if (action.type === ActionTypes.SET_BEST_MBLD_ATTEMPT) {
        return {
            ...store,
            bestMbldAttempt: action.payload.bestMbldAttempt,
        };
    }

    if (action.type === ActionTypes.SET_WCA_FORMATS) {
        return {
            ...store,
            wcaFormats: action.payload.wcaFormats,
        };
    }

    if (action.type === ActionTypes.SET_WCA_EVENTS) {
        return {
            ...store,
            wcaEvents: action.payload.wcaEvents,
        };
    }

    return store || defaultStore;
};

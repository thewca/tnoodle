import { ActionTypes } from "./Types";
import { defaultWcif } from "../constants/default.wcif";

// TODO find mbld expected name on the server side

const defaultStore = { wcif: defaultWcif };

export const Reducer = (store, action) => {
    if (action.type === ActionTypes.UPDATE_ME) {
        return {
            ...store,
            me: action.payload.me
        };
    }

    if (action.type === ActionTypes.UPDATE_EVENTS) {
        return {
            ...store,
            wcif: { ...store.wcif, events: action.payload.events }
        };
    }

    if (action.type === ActionTypes.UPDATE_PASSWORD) {
        return {
            ...store,
            wcif: { ...store.wcif, password: action.payload.password }
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITION_NAME) {
        let competitionName = action.payload.competitionName;
        let id = competitionName.replace(/[\W]/gi, "");
        return {
            ...store,
            wcif: {
                ...store.wcif,
                name: competitionName,
                shortName: competitionName,
                id: id
            }
        };
    }

    if (action.type === ActionTypes.UPDATE_WCA_EVENT) {
        return {
            ...store,
            wcif: {
                ...store.wcif,
                events: [
                    ...store.wcif.events.filter(
                        wcaEvent => wcaEvent.id !== action.payload.wcaEvent.id
                    ),
                    action.payload.wcaEvent
                ]
            }
        };
    }

    if (action.type === ActionTypes.UPDATE_MBLD) {
        return {
            ...store,
            wcif: {
                ...store.wcif,
                mbld: action.payload.mbld
            }
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITIONS) {
        return {
            ...store,
            competitions: action.payload.competitions
        };
    }

    /**
     * Either sets or reset WCIF to default.
     */
    if (action.type === ActionTypes.UPDATE_WCIF) {
        return {
            ...store,
            wcif: action.payload.wcif || defaultWcif
        };
    }

    return store || defaultStore;
};

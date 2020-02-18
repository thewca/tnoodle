import { ActionTypes } from "./Types";
import { MBLD_DEFAULT } from "../constants/wca.constants";

// TODO find out a better place for this and mbld expected name on the server side

const defaultWcif = {
    formatVersion: "1.0",
    name: "",
    events: [],
    password: "",
    mbld: MBLD_DEFAULT
};
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
            wcif: {...store.wcif, events: action.payload.events}
        };
    }

    if (action.type === ActionTypes.UPDATE_PASSWORD) {
        return {
            ...store,
            wcif: { ...store.wcif, password: action.payload.password }
        };
    }

    if (action.type === ActionTypes.UPDATE_COMPETITION_NAME) {
        return {
            ...store,
            wcif: {
                ...store.wcif,
                name: action.payload.competitionName
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

    return store || defaultStore;
};

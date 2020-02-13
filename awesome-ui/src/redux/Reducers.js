import { ActionTypes } from "./Types";

// TODO find out a better place for this and mbld expected name on the server side

const defaultWcif = {
  formatVersion: "1.0",
  name: "",
  events: [],
  password: "",
  mbld: 28
};
const defaultStore = { wcif: defaultWcif };

export const Reducer = (store, action) => {
  if (action.type === ActionTypes.UPDATE_ME) {
    return {
      ...store,
      me: action.payload.me
    };
  }

  if (action.type === ActionTypes.UPDATE_WCIF) {
    return {
      ...store,
      wcif: action.payload.wcif
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
      wcif: { ...store.wcif, name: action.payload.competitionName }
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

  return store || defaultStore;
};

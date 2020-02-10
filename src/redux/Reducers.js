import { ActionTypes } from "./Types";

const defaultWcif = {
  formatVersion: "1.0",
  name: "",
  events: [],
  password: ""
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

  return store || defaultStore;
};

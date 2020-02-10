import { ActionTypes } from "./Types";

export const updateMe = me => ({
  type: ActionTypes.UPDATE_ME,
  payload: { me: me }
});

export const updateWcif = wcif => ({
  type: ActionTypes.UPDATE_ME,
  payload: { wcif: wcif }
});

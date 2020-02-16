import { ActionTypes } from "./Types";

export const updateMe = me => ({
  type: ActionTypes.UPDATE_ME,
  payload: { me: me }
});

export const updateWcif = wcif => ({
  type: ActionTypes.UPDATE_ME,
  payload: { wcif: wcif }
});

export const updatePassword = password => ({
  type: ActionTypes.UPDATE_PASSWORD,
  payload: { password: password }
});

export const updateCompetitionName = competitionName => ({
  type: ActionTypes.UPDATE_COMPETITION_NAME,
  payload: { competitionName: competitionName }
});

export const updateWcaEvent = wcaEvent => ({
  type: ActionTypes.UPDATE_WCA_EVENT,
  payload: { wcaEvent: wcaEvent }
});

export const updateMbld = mbld => ({
  type: ActionTypes.UPDATE_MBLD,
  payload: { mbld: mbld }
});

export const updateCompetitions = competitions => ({
  type: ActionTypes.UPDATE_COMPETITIONS,
  payload: { competitions: competitions }
});

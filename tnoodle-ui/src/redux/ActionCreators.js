import { ActionTypes } from "./Types";

export const updateMe = me => ({
    type: ActionTypes.UPDATE_ME,
    payload: { me }
});

export const updateEvents = events => ({
    type: ActionTypes.UPDATE_EVENTS,
    payload: { events }
});

export const updatePassword = password => ({
    type: ActionTypes.UPDATE_PASSWORD,
    payload: { password }
});

export const updateCompetitionName = competitionName => ({
    type: ActionTypes.UPDATE_COMPETITION_NAME,
    payload: { competitionName }
});

export const updateWcaEvent = wcaEvent => ({
    type: ActionTypes.UPDATE_WCA_EVENT,
    payload: { wcaEvent }
});

export const updateMbld = mbld => ({
    type: ActionTypes.UPDATE_MBLD,
    payload: { mbld }
});

export const updateCompetitions = competitions => ({
    type: ActionTypes.UPDATE_COMPETITIONS,
    payload: { competitions }
});

export const updateWcif = wcif => ({
    type: ActionTypes.UPDATE_WCIF,
    payload: { wcif }
});

export const updateEditingStatus = flag => ({
    type: ActionTypes.UPDATE_EDITING_STATUS,
    payload: { editingStatus: flag }
});

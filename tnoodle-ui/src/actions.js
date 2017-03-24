import * as WcaApi from 'WcaApi';

export function fetchMe() {
  return wrapPromiseWithDispatch(WcaApi.me(), 'FETCH_ME');
}

export function fetchCompetitionJson(competitionId) {
  return wrapPromiseWithDispatch(WcaApi.getCompetitionJson(competitionId), 'FETCH_COMPETITION_JSON');
}

export function fetchUpcomingManageableCompetitions() {
  return wrapPromiseWithDispatch(WcaApi.getUpcomingManageableCompetitions(), 'FETCH_UPCOMING_COMPS');
}

export function saveCompetitionJson(competitionJson) {
  return wrapPromiseWithDispatch(WcaApi.saveCompetitionJson(competitionJson), 'SAVE_COMPETITION_JSON');
}

export function generateMissingScrambles(todo) {
  return (dispatch, getState) => {
    dispatch({
      type: "GENERATE_MISSING_SCRAMBLES",
      todo,
    });
  };
}

export function setPlannedGroupCount(activityCode, plannedGroupCount) {
  return {
    type: "SET_PLANNED_GROUP_COUNT",
    activityCode,
    plannedGroupCount,
  };
}

let promiseCounter = 1;
function wrapPromiseWithDispatch(promise, description) {
  let promiseId = promiseCounter++;
  return (dispatch, getState) => {
    dispatch({ type: description, status: 'start', promiseId });
    promise.then(response => {
      dispatch({ type: description, status: 'success', promiseId, response });
    }).catch(error => {
      dispatch({ type: description, status: 'error', promiseId, error });
    });
  };
}

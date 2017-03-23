import * as WcaApi from 'WcaApi';

export function fetchMe() {
  return (dispatch, getState) => {
    if(getState().me) {
      return;
    }
    dispatch({
      type: "FETCH_ME_REQUEST",
    });
    WcaApi.me().then(me => {
      dispatch({
        type: "FETCH_ME_SUCCESS",
        me,
      });
    }).catch(error => {
      dispatch({
        type: "FETCH_ME_FAILURE",
        error,
      });
    });
  };
}

export function fetchCompetitionJson(competitionId) {
  return (dispatch, getState) => {
    dispatch({
      type: "FETCH_COMPETITION_JSON_REQUEST",
      competitionId,
    });

    WcaApi.getCompetitionJson(competitionId).then(competitionJson => {
      dispatch({
        type: "FETCH_COMPETITION_JSON_SUCCESS",
        competitionJson,
      });
    }).catch(error => {
      dispatch({
        type: "FETCH_COMPETITION_JSON_FAILURE",
        competitionId,
        error,
      });
    });
  };
}

export function fetchUpcomingManageableCompetitions() {
  return (dispatch, getState) => {
    dispatch({
      type: "FETCH_UPCOMING_COMPS_REQUEST",
    });

    WcaApi.getUpcomingManageableCompetitions().then(competitions => {
      dispatch({
        type: "FETCH_UPCOMING_COMPS_SUCCESS",
        competitions,
      });
    }).catch(error => {
      dispatch({
        type: "FETCH_UPCOMING_COMPS_FAILURE",
      });
    });
  };
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

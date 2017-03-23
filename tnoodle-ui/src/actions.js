import * as WcaApi from 'WcaApi';

export function fetchMe() {
  return (dispatch, getState) => {
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
      });
    });
  };
}

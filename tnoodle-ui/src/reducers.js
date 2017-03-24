import { getActivity } from 'WcaCompetitionJson';

export const me = function(state=null, action) {
  if(action.type === "FETCH_ME" && action.status === "success") {
    return action.response;
  } else {
    return state;
  }
};

export const originalCompetitionJson = function(state=null, action) {
  if(action.type === "SAVE_COMPETITION_JSON" && action.status === "success") {
    return action.response;
  } else if(action.type === "FETCH_COMPETITION_JSON" && action.status === "success") {
    return action.response;
  } else {
    return state;
  }
};

export const competitionJson = function(state=null, action) {
  if(action.type === "FETCH_COMPETITION_JSON" && action.status === "success") {
    return action.response;
  } else if(action.type === "SET_PLANNED_GROUP_COUNT") {
    let competitionJson = deepcopy(state);
    let round = getActivity(competitionJson, action.activityCode);
    round.plannedGroupCount = action.plannedGroupCount;
    return competitionJson;
  } else {
    return state;
  }
};

export const upcomingManageableCompetitions = function(competitions=null, action) {
  if(action.type === "FETCH_UPCOMING_COMPS" && action.status === "success") {
    return action.response;
  }
  return competitions;
};

export const errorMessage = function(errorMessage=null, action) {
  if(action.error) {
    return action.error;
  }
  return errorMessage;
};

export const ongoingPromises = function(state={}, action) {
  if(!action.promiseId) {
    return state;
  }

  state = deepcopy(state);
  switch(action.status) {
    case 'start':
      state[action.promiseId] = true;
      return state;
    case 'success':
    case 'error':
      delete state[action.promiseId];
      return state;
    default:
      return state;
  }
};

function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

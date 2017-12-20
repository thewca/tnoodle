import { getActivity, normalizeCompetitionJson } from 'WcaCompetitionJson';
import deepcopy from 'deepcopy';

export const me = function(state=null, action) {
  if(action.type === "FETCH_ME" && action.status === "success") {
    return action.response;
  } else {
    return state;
  }
};

export const versionInfo = function(state=null, action) {
  if(action.type === "FETCH_VERSION_INFO" && action.status === "success") {
    return action.response;
  } else {
    return state;
  }
};

export const competitionJson = function(state=null, action) {
  if(action.type === "FETCH_COMPETITION_JSON" && action.status === "success") {
    return normalizeCompetitionJson(action.response);
  } else if(action.type === "GROUP_FOR_ROUND") {
    let competitionJson = deepcopy(state);
    let round = getActivity(competitionJson, action.activityCode);
    round.groups.push({
      group: action.groupName,
      scrambles: action.scrambles,
    });
    return normalizeCompetitionJson(competitionJson);
  } else if(action.type === "CLEAR_COMPETITION_SCRAMBLES") {
    let competitionJson = deepcopy(state);
    competitionJson.events.forEach(event => {
      event.rounds.forEach(round => {
        round.groups = [];
      });
    });
    return normalizeCompetitionJson(competitionJson);
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

import { getRound, normalizeCompetitionJson } from 'WcaCompetitionJson';
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
  } else if(action.type === "SCRAMBLE_SET_FOR_ROUND") {
    let competitionJson = deepcopy(state);
    let round = getRound(competitionJson, action.activityCode);
    round.scrambleSets.push({
      id: action.scrambleSetId,
      scrambles: action.scrambles,
      extraScrambles: action.extraScrambles,
    });
    return normalizeCompetitionJson(competitionJson);
  } else if(action.type === "CLEAR_SCRAMBLES") {
    let competitionJson = deepcopy(state);
    competitionJson.events.forEach(event => {
      event.rounds.forEach(round => {
        round.scrambleSets = [];
      });
    });
    return normalizeCompetitionJson(competitionJson);
  } else {
    return state;
  }
};

export const isGeneratingScrambles = function(state=false, action) {
  if(action.type === "GENERATE_MISSING_SCRAMBLES") {
    return true;
  } else if(action.type === "DONE_GENERATING_SCRAMBLES") {
    return false;
  } else {
    return state;
  }
}

export const isGeneratingZip = function(state=false, action) {
  if(action.type === "BEGIN_FETCH_SCRAMBLE_ZIP") {
    return true;
  } else if(action.type === "SCRAMBLE_ZIP_FETCHED") {
    return false;
  } else {
    return state;
  }
}

export const loadCompetitionJsonError = function(state=null, action) {
  if(action.type === "FETCH_COMPETITION_JSON" && action.status === "error") {
    return action.error;
  } else {
    return state;
  }
}

export const puzzlesPer333mbfAttempt = function(state=28, action) {
  if(action.type === "SET_PUZZLES_PER_333MBF_ATTEMPT") {
    return action.puzzlesPer333mbfAttempt;
  } else {
    return state;
  }
}

export const scrambleZip = function(state=null, action) {
  if(action.type === "SCRAMBLE_ZIP_FETCHED") {
    return {
      title: action.title,
      url: URL.createObjectURL(action.blob),
    };
  } else if(action.type === "CLEAR_SCRAMBLE_ZIP") {
    return null;
  } else {
    return state;
  }
}

export const scramblePassword = function(state=null, action) {
  if(action.type === "SET_SCRAMBLE_PASSWORD") {
    return action.scramblePassword;
  } else {
    return state;
  }
}

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

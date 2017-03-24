import { getActivity } from 'WcaCompetitionJson';

export const me = function(me=null, action) {
  switch(action.type) {
    case "FETCH_ME_SUCCESS":
      return action.me;
    default:
      return me;
  }
};

export const originalCompetitionJson = function(competitionJson=null, action) {
  switch(action.type) {
    case "FETCH_COMPETITION_JSON_SUCCESS":
      return action.competitionJson;
    case "SAVE_COMPETITION_JSON_SUCCESS":
      return action.competitionJson;
    default:
      return competitionJson;
  }
};

export const competitionJson = function(competitionJson=null, action) {
  switch(action.type) {
    case "FETCH_COMPETITION_JSON_SUCCESS":
      return action.competitionJson;
    case "SET_PLANNED_GROUP_COUNT":
      competitionJson = deepcopy(competitionJson);
      let round = getActivity(competitionJson, action.activityCode);
      round.plannedGroupCount = action.plannedGroupCount;
      return competitionJson;
    default:
      return competitionJson;
  }
};

export const upcomingManageableCompetitions = function(competitions=null, action) {
  switch(action.type) {
    case "FETCH_UPCOMING_COMPS_SUCCESS":
      return action.competitions;
    default:
      return competitions;
  }
};

export const errorMessage = function(errorMessage=null, action) {
  if(action.error) {
    return action.error;
  }
  return errorMessage;
};

function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

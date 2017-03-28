import * as WcaApi from 'WcaApi';
import tnoodle from 'TNoodleApi';
import { buildActivityCode, getActivity, formatIdToScrambleCount, getNextAvailableGroupName } from 'WcaCompetitionJson';

const scrambler = new tnoodle.Scrambler('localhost', '2014');

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

export function clearCompetitionScrambles() {
  return {
    type: "CLEAR_COMPETITION_SCRAMBLES",
  };
}

export function generateMissingScrambles(rounds) {
  return (dispatch, getState) => {
    dispatch({
      type: "GENERATE_MISSING_SCRAMBLES",
      rounds,
    });

    let state = getState();
    let competitionJson = state.competitionJson;
    rounds.forEach(round => {
      let activityCode = buildActivityCode(round);
      let wcaRound = getActivity(competitionJson, activityCode);
      let groupsToGenerateCount = wcaRound.plannedGroupCount - wcaRound.groups.length;
      let usedGroupNames = wcaRound.groups.map(wcaGroup => wcaGroup.group);
      let namesOfGroupsToGenerate = [];
      for(let i = 0; i < groupsToGenerateCount; i++) {
        namesOfGroupsToGenerate.push(getNextAvailableGroupName(usedGroupNames.concat(namesOfGroupsToGenerate)));
      }
      let scramblesPerGroup = formatIdToScrambleCount(wcaRound.formatId);
      namesOfGroupsToGenerate.forEach(groupName => {
        scrambler.loadScrambles(scrambles => {
          dispatch({
            type: "GROUP_FOR_ROUND",
            activityCode,
            groupName,
            scrambles,
          });
        }, round.eventId, null, scramblesPerGroup);
      });
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


function competitionJsonToTNoodleScrambleRequest(competitionJson) {
  function eventToPuzzle(eventId) {
    let puzzByEvent = {
      "333bf": "333ni",
      "333oh": "333",
      "333fm": "333fm",
      "333ft": "333",
      "444bf": "444ni",
      "555bf": "555ni",
      "333mbf": "333ni",
    };
    return puzzByEvent[eventId] || eventId;
  }
  function isFmc(eventId) {
    // Does this eventId end in "fm"?
    return !!eventId.match(/.*fm$/);
  }

  let scrambleRequest = [];
  competitionJson.events.forEach(event => {
    event.rounds.forEach(round => {
      round.groups.forEach(group => {
        let scrambles = group.scrambles;
        let extraScrambles = group.extraScrambles;
        let copies = 1;//<<<
        let scrambler = eventToPuzzle(event.eventId);
        let title = `Round ${round.nthRound} Group ${group.group}`;
        let request = {
          scrambles: scrambles,
          extraScrambles: extraScrambles,
          copies,
          scrambler,
          title,
          fmc: isFmc(event.eventId),

          event: event.eventId,
          round: round.nthRound,
          group: group.group,
        };
        scrambleRequest.push(request);
      });
    });
  });
  return scrambleRequest;
}

export function downloadScrambles(asPdf) {
  return (dispatch, getState) => {
    let state = getState();
    let competitionJson = state.competitionJson;

    let request = competitionJsonToTNoodleScrambleRequest(competitionJson);
    let title = `Scrambles for ${competitionJson.competitionId}`;
    let password = null;//<<<
    if(asPdf) {
      scrambler.showPdf(title, request, password, '_blank');
    } else {
      scrambler.showZip(title, request, password, '');
    }
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

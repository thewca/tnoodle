import events from 'wca/events';
import * as WcaApi from 'WcaApi';
import tnoodle from 'TNoodleApi';
import { parseActivityCode, getRound, formatToScrambleCount, checkJson } from 'WcaCompetitionJson';
import indexToLetters from 'indexToLetters';

let TNOODLE_BASE_URL = "http://localhost:2014";
const scrambler = new tnoodle.Scrambler(TNOODLE_BASE_URL);

export function fetchMe() {
  return wrapPromiseWithDispatch(WcaApi.me(), 'FETCH_ME');
}

export function fetchCompetitionJson(competitionId) {
  return wrapPromiseWithDispatch(WcaApi.getCompetitionJson(competitionId), 'FETCH_COMPETITION_JSON');
}

export function fetchUpcomingManageableCompetitions() {
  return wrapPromiseWithDispatch(WcaApi.getUpcomingManageableCompetitions(), 'FETCH_UPCOMING_COMPS');
}

export function fetchVersionInfo() {
  return wrapPromiseWithDispatch(async function() {
    return await (await fetch(`${TNOODLE_BASE_URL}/version.json`)).json();
  }(), 'FETCH_VERSION_INFO');
}

export function generateMissingScrambles(rounds) {
  return (dispatch, getState) => {
    dispatch({
      type: "GENERATE_MISSING_SCRAMBLES",
    });

    let { roundsWithMissingSets: rounds } = checkJson(getState().competitionJson);
    let puzzlesPer333mbfAttempt = getState().puzzlesPer333mbfAttempt;
    rounds.forEach(round => {
      let activityCode = round.id;
      let { eventId, roundNumber } = parseActivityCode(activityCode);
      let wcaRound = getRound(getState().competitionJson, activityCode);
      let setsToGenerateCount = wcaRound.scrambleSetCount - wcaRound.scrambleSets.length;
      let idsOfSetsToGenerate = [];
      for(let i = 0; i < setsToGenerateCount; i++) {
        idsOfSetsToGenerate.push(`${eventId}-r${roundNumber}-set${i+1}`);
      }
      let { scrambleCount, extraScrambleCount } = formatToScrambleCount(wcaRound.format, eventId);
      idsOfSetsToGenerate.forEach(scrambleSetId => {
        let tnoodlePuzzle = eventToTNoodlePuzzle(eventId);
        let tnoodleScramblesToGenerate = (scrambleCount + extraScrambleCount);
        if(eventId === "333mbf") {
          tnoodleScramblesToGenerate *= puzzlesPer333mbfAttempt;
        }

        scrambler.loadScrambles(generatedScrambles => {
          let scrambles, extraScrambles;
          if(eventId === "333mbf") {
            scrambles = [];
            extraScrambles = [];
            for(let i = 0; i < scrambleCount; i++) {
              scrambles = scrambles.concat(generatedScrambles.splice(0, puzzlesPer333mbfAttempt).join("\n"));
            }
            for(let i = 0; i < extraScrambleCount; i++) {
              extraScrambles = extraScrambles.concat(generatedScrambles.splice(0, puzzlesPer333mbfAttempt).join("\n"));
            }
          } else {
            scrambles = generatedScrambles.slice(0, scrambleCount);
            extraScrambles = generatedScrambles.slice(scrambleCount, scrambleCount + extraScrambleCount);
          }

          dispatch({
            type: "SCRAMBLE_SET_FOR_ROUND",
            activityCode,
            scrambleSetId,
            scrambles,
            extraScrambles,
          });

          dispatch(maybeRegenerateScramblesZip());
        }, tnoodlePuzzle, null, tnoodleScramblesToGenerate);
      });
    });
  };
}

function eventToTNoodlePuzzle(eventId) {
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

function competitionJsonToTNoodleScrambleRequest(competitionJson) {
  function isFmc(eventId) {
    // Does this eventId end in "fm"?
    return !!eventId.match(/.*fm$/);
  }

  let scrambleRequest = [];
  competitionJson.events.forEach(event => {
    event.rounds.forEach(round => {
      let { roundNumber } = parseActivityCode(round.id);
      round.scrambleSets.forEach((scrambleSet, index) => {
        let scrambles = scrambleSet.scrambles;
        let extraScrambles = scrambleSet.extraScrambles;
        let copies = 1;
        let scrambler = eventToTNoodlePuzzle(event.id);
        let prettyIndex = indexToLetters(index);
        let title = `${events.byId[event.id].name} Round ${roundNumber} Scramble Set ${prettyIndex}`;
        let request = {
          scrambles: scrambles,
          extraScrambles: extraScrambles,
          copies,
          scrambler,
          title,
          fmc: isFmc(event.id),

          event: event.id,
          round: roundNumber,
          group: prettyIndex, // This legacy field is still used by the WCA Workbook Assistant. When we get rid of the WA, we can get rid of this.
          scrambleSetId: scrambleSet.id,
        };
        scrambleRequest.push(request);
      });
    });
  });
  return scrambleRequest;
}

export function setScramblePassword(scramblePassword) {
  return (dispatch, getState) => {
    if(getState().isGeneratingScrambles || getState().isGeneratingZip) {
      throw new Error("Cannot set scramble password while generating scrambles or zip file");
    }

    dispatch({
      type: "SET_SCRAMBLE_PASSWORD",
      scramblePassword,
    });
    dispatch({ type: "CLEAR_SCRAMBLE_ZIP" });
  }
}

export function setPuzzlesPer333mbfAttempt(puzzlesPer333mbfAttempt) {
  return (dispatch, getState) => {
    if(getState().isGeneratingScrambles || getState().isGeneratingZip) {
      throw new Error("Cannot set puzzles per 333mbf attempt while generating scrambles or zip file");
    }

    dispatch({
      type: "SET_PUZZLES_PER_333MBF_ATTEMPT",
      puzzlesPer333mbfAttempt,
    });
    dispatch({ type: "CLEAR_SCRAMBLE_ZIP" });
    dispatch({ type: "CLEAR_SCRAMBLES" });
  };
}

export function maybeRegenerateScramblesZip() {
  return (dispatch, getState) => {
    let { currentScrambleCount, scramblesNeededCount } = checkJson(getState().competitionJson);
    if(currentScrambleCount >= scramblesNeededCount) {
      dispatch({ type: "DONE_GENERATING_SCRAMBLES" });
      dispatch({ type: "CLEAR_SCRAMBLE_ZIP" });
      dispatch(downloadScrambles({ pdf: false, password: getState().scramblePassword }));
    }
  };
}

export function downloadScrambles({ pdf, password }) {
  return (dispatch, getState) => {
    let state = getState();
    let competitionJson = state.competitionJson;

    let request = competitionJsonToTNoodleScrambleRequest(competitionJson);
    let title = `Scrambles for ${competitionJson.name}`;
    if(pdf) {
      return scrambler.showPdf(title, request, password, "_blank");
    } else {
      dispatch({ type: "BEGIN_FETCH_SCRAMBLE_ZIP" });
      return scrambler.fetchZip(title, request, password).then(titleBlob => dispatch({
        type: "SCRAMBLE_ZIP_FETCHED",
        ...titleBlob,
      }));
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

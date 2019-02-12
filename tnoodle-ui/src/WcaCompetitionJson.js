import deepcopy from 'deepcopy';

export function formatToScrambleCount(format, eventId) {
  // From https://github.com/thewca/worldcubeassociation.org/blob/master/WcaOnRails/db/seeds/formats.seeds.rb
  let scrambleCount = {
    "1": 1,
    "2": 2,
    "3": 3,
    "a": 5,
    "m": 3,
  }[format];
  if(!scrambleCount) {
    throw new Error(`Unrecognized format: ${format}`);
  }

  let extraScrambleCount = (eventId === "333mbf" || eventId === "333fm" ? 0 : 2);
  return { scrambleCount, extraScrambleCount };
}

// Modified from https://github.com/jfly/tnoodle/blob/c2b529e6292469c23f33b1d73839e22f041443e0/tnoodle-ui/src/WcaCompetitionJson.js#L52
export function parseActivityCode(activityCode) {
    let eventId, roundNumber, group, attempt;
    let parts = activityCode.split("-");
    eventId = parts.shift();
    
    parts.forEach(part => {
      if (/^([a-z]\d)/.test(part)) { // regex for letter number
        let firstLetter = part[0];
        let rest = part.substring(1);
        if(firstLetter === "r") {
          roundNumber = parseInt(rest, 10);
        } else if(firstLetter === "g") {
          group = rest;
        } else if(firstLetter === "a") {
          attempt = rest;
        } else {
          throw new Error(`Unrecognized activity code part: ${part} of ${activityCode}`);
        }
      } else {
        throw new Error(`Unrecognized activity code part: ${part} of ${activityCode}`);
      }
    });
    return { eventId, roundNumber, group, attempt };
  }

export function buildActivityCode(activity) {
  let activityCode = activity.eventId;
  if(activity.roundNumber) {
    activityCode += "-r" + activity.roundNumber;
  }
  if(activity.group) {
    activityCode += "-g" + activity.group;
  }

  return activityCode;
}

export function getRound(wcaCompetitionJson, activityCode) {
  let activity = parseActivityCode(activityCode);

  if(!activity.eventId) {
    throw new Error(`Activity code ${activityCode} missing eventId`);
  }
  let event = wcaCompetitionJson.events.find(event => event.id === activity.eventId);

  if(!activity.roundNumber) {
    throw new Error(`Activity code ${activityCode} missing roundNumber`);
  }
  let round = event.rounds[activity.roundNumber - 1];
  if(!round) {
    throw new Error(`Could not find round corresponding to activity code ${activityCode}`);
  }

  if(activity.group) {
    throw new Error(`Activity code ${activityCode} should not have a group`);
  }

  return round;
}

export function normalizeCompetitionJson(competitionJson) {
  competitionJson = deepcopy(competitionJson);
  competitionJson.events = competitionJson.events || [];
  competitionJson.events.forEach(event => {
    event.rounds.forEach(round => {
      round.scrambleSets = round.scrambleSets || [];
      if(!round.scrambleSetCount) {
        // We look at scrambleGroupCount here for backwards compatibility.
        // The attribute has been renamed to scrambleSetCount, but the WCA website has not
        // yet been updated accordingly.
        // TODO: remove the reference to scrambleGroupCount once the WCA website has been updated.
        round.scrambleSetCount = round.scrambleSetCount || round.scrambleGroupCount || round.scrambleSets.length || 1;
      }
      round.scrambleSets.forEach(scrambleSet => {
        scrambleSet.scrambles = scrambleSet.scrambles || [];
        scrambleSet.extraScrambles = scrambleSet.extraScrambles || [];
      });
    });
  });
  return competitionJson;
}

export function checkJson(wcaCompetitionJson) {
  let checked = {
    finishedRounds: [],
    setsWithWrongNumberOfScrambles: [],
    roundsWithMissingSets: [],
    warnings: [],
    currentScrambleCount: 0,
    scramblesNeededCount: 0,
  };

  wcaCompetitionJson.events.forEach(wcaEvent => {
    wcaEvent.rounds.forEach(wcaRound => {
      let eventId = wcaEvent.id;

      if(!wcaRound.format) {
        checked.warnings.push({
          id: wcaRound.id,

          message: "Missing or invalid format",
        });
        return;
      }

      let { scrambleCount: requiredScrambleCountPerSet, extraScrambleCount: requiredExtraScrambleCountPerSet } = formatToScrambleCount(wcaRound.format, eventId);
      checked.scramblesNeededCount += (requiredScrambleCountPerSet + requiredExtraScrambleCountPerSet) * wcaRound.scrambleSetCount;

      let roundScramblesPerfect = true;
      if(wcaRound.scrambleSets.length < wcaRound.scrambleSetCount) {
        checked.roundsWithMissingSets.push({
          id: wcaRound.id,

          scrambleSetCount: wcaRound.scrambleSets.length,
          correctScrambleSetCount: wcaRound.scrambleSetCount,
        });
        roundScramblesPerfect = false;
      }

      wcaRound.scrambleSets.forEach(wcaScrambleSet => {
        let scrambleCount = wcaScrambleSet.scrambles.length;
        checked.currentScrambleCount += scrambleCount;

        let extraScrambleCount = wcaScrambleSet.extraScrambles.length;
        checked.currentScrambleCount += extraScrambleCount;

        if(scrambleCount !== requiredScrambleCountPerSet) {
          checked.setsWithWrongNumberOfScrambles.push({
            id: wcaScrambleSet.id,

            scrambleCount,
            requiredScrambleCountPerSet,
          });
          roundScramblesPerfect = false;
          return;
        }

        if(extraScrambleCount !== requiredExtraScrambleCountPerSet) {
          checked.setsWithWrongNumberOfScrambles.push({
            id: wcaScrambleSet.id,

            extraScrambleCount,
            requiredExtraScrambleCountPerSet,
          });
          roundScramblesPerfect = false;
          return;
        }
      });

      if(roundScramblesPerfect) {
        checked.finishedRounds.push({
          id: wcaRound.id,
        });
      }
    });
  });

  return checked;
}

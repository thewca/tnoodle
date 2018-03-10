import _ from 'lodash';

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

  let extraScrambleCount = (eventId !== "333mbf" ? 2 : 0);
  return { scrambleCount, extraScrambleCount };
}

const nextLetterInAlphabet = letter => {
  let nthLetter = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  if(nthLetter >= 26) {
    return null;
  }
  return String.fromCharCode('A'.charCodeAt(0) + nthLetter);
};

export function getNextGroupName(groupName) {
  if(groupName === "") {
    return "A";
  }

  let allButLastLetter = groupName.substring(0, groupName.length - 1);
  let lastLetter = groupName[groupName.length - 1];
  let nextLetter = nextLetterInAlphabet(lastLetter);
  if(nextLetter) {
    return allButLastLetter + nextLetter;
  } else {
    return getNextGroupName(allButLastLetter) + "A";
  }
}

export function getNextAvailableGroupName(usedGroupNames) {
  let potentialGroupName = "A";
  while(usedGroupNames.indexOf(potentialGroupName) >= 0) {
    potentialGroupName = getNextGroupName(potentialGroupName);
  }
  return potentialGroupName;
}

export function parseActivityCode(activityCode) {
  let eventId, roundNumber, group;
  let parts = activityCode.split("-");
  eventId = parts.shift();

  parts.forEach(part => {
    let firstLetter = part[0];
    let rest = part.substring(1);
    if(firstLetter === "r") {
      roundNumber = parseInt(rest, 10);
    } else if(firstLetter === "g") {
      group = rest;
    } else {
      throw new Error(`Unrecognized activity code part: ${part} of ${activityCode}`);
    }
  });
  return { eventId, roundNumber, group };
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

export function getActivity(wcaCompetitionJson, activityCode) {
  let activity = parseActivityCode(activityCode);

  if(!activity.eventId) {
    return wcaCompetitionJson;
  }
  let event = wcaCompetitionJson.events.find(event => event.id === activity.eventId);

  if(!activity.roundNumber) {
    return event;
  }
  let round = event.rounds[activity.roundNumber - 1];

  if(!activity.group) {
    return round;
  }
  let group = round.groups.find(group => group.group === activity.group);

  return group;
}

export function normalizeCompetitionJson(competitionJson) {
  competitionJson = deepcopy(competitionJson);
  competitionJson.events = competitionJson.events || [];
  competitionJson.events.forEach(event => {
    event.rounds.forEach(round => {
      round.groups = round.groups || [];
      if(!round.scrambleSetCount) {
        // We look at scrambleGroupCount here for backwards compatibility.
        // The attribute has been renamed to scrambleSetCount, but the WCA website has not
        // yet been updated accordingly.
        round.scrambleSetCount = round.scrambleGroupCount || round.groups.length || 1;
      }
      round.groups.forEach(group => {
        group.scrambles = group.scrambles || [];
        group.extraScrambles = group.extraScrambles || [];
      });
      round.groups = _.sortBy(round.groups, group => group.group);
    });
  });
  return competitionJson;
}

export function checkScrambles(wcaCompetitionJson) {
  let checked = {
    finishedRounds: [],
    groupsWithWrongNumberOfScrambles: [],
    roundsWithMissingGroups: [],
    warnings: [],
    currentScrambleCount: 0,
    scramblesNeededCount: 0,
  };

  wcaCompetitionJson.events.forEach(wcaEvent => {
    wcaEvent.rounds.forEach(wcaRound => {
      let eventId = wcaEvent.id;
      let { roundNumber } = parseActivityCode(wcaRound.id);

      if(!wcaRound.format) {
        checked.warnings.push({
          id: buildActivityCode({ eventId, roundNumber }),

          message: "Missing or invalid format",
        });
        return;
      }

      let { scrambleCount: requiredScrambleCountPerGroup, extraScrambleCount: requiredExtraScrambleCountPerGroup } = formatToScrambleCount(wcaRound.format, eventId);
      checked.scramblesNeededCount += (requiredScrambleCountPerGroup + requiredExtraScrambleCountPerGroup) * wcaRound.scrambleSetCount;

      let roundScramblesPerfect = true;
      if(wcaRound.groups.length < wcaRound.scrambleSetCount) {
        checked.roundsWithMissingGroups.push({
          id: buildActivityCode({ eventId, roundNumber }),
          groupCount: wcaRound.groups.length,
          scrambleSetCount: wcaRound.scrambleSetCount,
        });
        roundScramblesPerfect = false;
      }

      wcaRound.groups.forEach(wcaGroup => {
        let { group } = wcaGroup;

        if(!group) {
          checked.warnings.push({
            id: buildActivityCode({ eventId, roundNumber }),

            message: "Group has no group name",
          });
          roundScramblesPerfect = false;
          return;
        }

        let scrambleCount = wcaGroup.scrambles.length;
        checked.currentScrambleCount += scrambleCount;

        let extraScrambleCount = wcaGroup.extraScrambles.length;
        checked.currentScrambleCount += extraScrambleCount;

        if(scrambleCount !== requiredScrambleCountPerGroup) {
          checked.groupsWithWrongNumberOfScrambles.push({
            id: buildActivityCode({ eventId, roundNumber, group }),

            scrambleCount,
            requiredScrambleCountPerGroup,
          });
          roundScramblesPerfect = false;
          return;
        }

        if(extraScrambleCount !== requiredExtraScrambleCountPerGroup) {
          checked.groupsWithWrongNumberOfScrambles.push({
            id: buildActivityCode({ eventId, roundNumber, group }),

            extraScrambleCount,
            requiredExtraScrambleCountPerGroup,
          });
          roundScramblesPerfect = false;
          return;
        }
      });

      if(roundScramblesPerfect) {
        checked.finishedRounds.push({
          id: buildActivityCode({ eventId, roundNumber }),
          groupCount: wcaRound.groups.length,
          scrambleSetCount: wcaRound.scrambleSetCount,
        });
      }
    });
  });

  return checked;
}

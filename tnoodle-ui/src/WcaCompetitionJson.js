import _ from 'lodash';

import deepcopy from 'deepcopy';

export function formatIdToScrambleCount(formatId) {
  // From https://github.com/thewca/worldcubeassociation.org/blob/master/WcaOnRails/db/seeds/formats.seeds.rb
  return {
    "1": 1,
    "2": 2,
    "3": 3,
    "a": 5,
    "m": 3,
  }[formatId];
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
  let [ eventId, nthRound, group ] = activityCode.split("-");
  nthRound = parseInt(nthRound, 10);
  return { eventId, nthRound, group };
}

export function buildActivityCode(activity) {
  return [ activity.eventId, activity.nthRound, activity.group ].filter(el => el).join("-");
}

export function getActivity(wcaCompetitionJson, activityCode) {
  let activity = parseActivityCode(activityCode);

  if(!activity.eventId) {
    return wcaCompetitionJson;
  }
  let event = wcaCompetitionJson.events.find(event => event.eventId === activity.eventId);

  if(!activity.nthRound) {
    return event;
  }
  let round = event.rounds.find(round => round.nthRound === activity.nthRound);

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
      if(!round.plannedGroupCount) {
        round.plannedGroupCount = round.groups.length || 1;
      }
      round.groups.forEach(group => {
        group.scrambles = group.scrambles || [];
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
  };

  wcaCompetitionJson.events.forEach(wcaEvent => {
    wcaEvent.rounds.forEach(wcaRound => {
      if(!wcaRound.nthRound) {
        checked.warnings.push({
          eventId: wcaEvent.eventId,
          message: "Missing nthRound",
        });
        return;
      }

      if(!wcaRound.formatId) {
        checked.warnings.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          message: "Missing or invalid formatId",
        });
        return;
      }

      let roundScramblesPerfect = true;
      if(wcaRound.groups.length < wcaRound.plannedGroupCount) {
        checked.roundsWithMissingGroups.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          groupCount: wcaRound.groups.length,
          plannedGroupCount: wcaRound.plannedGroupCount,
        });
        roundScramblesPerfect = false;
      }

      wcaRound.groups.forEach(wcaGroup => {
        if(!wcaGroup.group) {
          checked.warnings.push({
            eventId: wcaEvent.eventId,
            nthRound: wcaRound.nthRound,
            message: "Group has no group name",
          });
          roundScramblesPerfect = false;
          return;
        }

        let scrambleCount = wcaGroup.scrambles.length;
        let requiredScrambleCount = formatIdToScrambleCount(wcaRound.formatId);
        if(scrambleCount !== requiredScrambleCount) {
          checked.groupsWithWrongNumberOfScrambles.push({
            eventId: wcaEvent.eventId,
            nthRound: wcaRound.nthRound,
            group: wcaGroup.group,

            scrambleCount,
            requiredScrambleCount,
          });
          roundScramblesPerfect = false;
          return;
        }
      });

      if(roundScramblesPerfect) {
        checked.finishedRounds.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          groupCount: wcaRound.groups.length,
          plannedGroupCount: wcaRound.plannedGroupCount,
        });
      }
    });
  });

  return checked;
}

// From https://github.com/thewca/worldcubeassociation.org/blob/master/WcaOnRails/db/seeds/formats.seeds.rb
const scrambleCountByFormatId = {
  "1": 1,
  "2": 2,
  "3": 3,
  "a": 5,
  "m": 3,
};

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

export function checkScrambles(wcaCompetitionJson) {
  let checked = {
    finishedRounds: [],
    groupsWithWrongNumberOfScrambles: [],
    roundsWithMissingGroups: [],
    warnings: [],
  };

  (wcaCompetitionJson.events || []).forEach(wcaEvent => {
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

      let groups = wcaRound.groups || [];
      if(!wcaRound.plannedGroupCount) {
        wcaRound.plannedGroupCount = groups.length || 1;
      }

      let roundScramblesPerfect = true;

      if(groups.length < wcaRound.plannedGroupCount) {
        checked.roundsWithMissingGroups.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          groupCount: groups.length,
          plannedGroupCount: wcaRound.plannedGroupCount,
        });
        roundScramblesPerfect = false;
      }

      groups.forEach(wcaGroup => {
        if(!wcaGroup.group) {
          checked.warnings.push({
            eventId: wcaEvent.eventId,
            nthRound: wcaRound.nthRound,
            message: "Group has no group name",
          });
          roundScramblesPerfect = false;
          return;
        }

        let scrambleCount = (wcaGroup.scrambles || []).length;
        let requiredScrambleCount = scrambleCountByFormatId[wcaRound.formatId];
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
          groupCount: groups.length,
          plannedGroupCount: wcaRound.plannedGroupCount,
        });
      }
    });
  });

  return checked;
}

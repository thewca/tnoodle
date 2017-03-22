
// From https://github.com/thewca/worldcubeassociation.org/blob/master/WcaOnRails/db/seeds/formats.seeds.rb
const scrambleCountByFormatId = {
  "1": 1,
  "2": 2,
  "3": 3,
  "a": 5,
  "m": 3,
};

export function checkScrambles(wcaCompetitionJson) {
  let checked = {
    done: [],
    todo: [],
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
      if(groups.length === 0) {
        checked.todo.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          message: "No scramble groups found",
        });
        return;
      }

      let roundScramblesPerfect = true;
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
        if(scrambleCount < requiredScrambleCount) {
          checked.todo.push({
            eventId: wcaEvent.eventId,
            nthRound: wcaRound.nthRound,
            group: wcaGroup.group,
            message: `Found ${scrambleCount} scrambles, need ${requiredScrambleCount}`,
          });
          roundScramblesPerfect = false;
          return;
        }
      });

      if(roundScramblesPerfect) {
        checked.done.push({
          eventId: wcaEvent.eventId,
          nthRound: wcaRound.nthRound,
          message: "Scrambles look good!",
        });
      }
    });
  });

  return checked;
}

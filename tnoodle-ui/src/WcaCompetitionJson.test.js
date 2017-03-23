import { checkScrambles } from 'WcaCompetitionJson';

it('checkScrambles finds missing scrambles', () => {
  let wcaCompetitionJson = {
    events: [
      {
        eventId: "333",
        rounds: [
          {
            nthRound: 1,
            roundId: "",
            formatId: "",
            groups: [],
          },
          {
            nthRound: 2,
            roundId: "",
            formatId: "a",
            groups: [
              {
                group: "a",
                scrambles: [ "1", "2", "3" ],
              },
            ],
          },
          {
            nthRound: 3,
            roundId: "",
            formatId: "a",
            groups: [
              {
                group: "a",
                scrambles: [ "1", "2", "3", "4", "5" ],
              },
            ],
          },
          {
            nthRound: 4,
            roundId: "",
            formatId: "a",
            plannedGroupCount: 2,
            groups: [
              {
                group: "a",
                scrambles: [ "1", "2", "3", "4", "5" ],
              },
            ],
          },
        ],
      },
      {
        eventId: "222",
        rounds: [
          {
            nthRound: 1,
            roundId: "",
            formatId: "a",
            groups: [],
          },
          {
            nthRound: 2,
            roundId: "",
            formatId: "a",
            groups: null,
          },
        ],
      },
    ],
  };

  let checkedScrambles = checkScrambles(wcaCompetitionJson);

  expect(checkedScrambles).toEqual({
    finishedRounds: [
      {
        eventId: "333",
        nthRound: 3,
        groupCount: 1,
        plannedGroupCount: 1,
      },
    ],
    groupsWithWrongNumberOfScrambles: [
      {
        eventId: "333",
        nthRound: 2,
        group: "a",
        scrambleCount: 3,
        requiredScrambleCount: 5,
      },
    ],
    roundsWithMissingGroups: [
      {
        eventId: "333",
        nthRound: 4,
        groupCount: 1,
        plannedGroupCount: 2,
      },
      {
        eventId: "222",
        nthRound: 1,
        groupCount: 0,
        plannedGroupCount: 1,
      },
      {
        eventId: "222",
        nthRound: 2,
        groupCount: 0,
        plannedGroupCount: 1,
      },
    ],
    warnings: [
      {
        eventId: "333",
        nthRound: 1,
        message: "Missing or invalid formatId",
      },
    ],
  });
});

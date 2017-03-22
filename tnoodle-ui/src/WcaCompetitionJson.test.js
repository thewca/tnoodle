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
    done: [
      {
        eventId: "333",
        nthRound: 3,
        message: "Scrambles look good!",
      },
    ],
    todo: [
      {
        eventId: "333",
        nthRound: 2,
        group: "a",
        message: "Found 3 scrambles, need 5",
      },
      {
        eventId: "222",
        nthRound: 1,
        message: "No scramble groups found",
      },
      {
        eventId: "222",
        nthRound: 2,
        message: "No scramble groups found",
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

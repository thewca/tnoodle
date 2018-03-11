import {
  checkJson,
  normalizeCompetitionJson,
  parseActivityCode,
  buildActivityCode,
} from 'WcaCompetitionJson';

it('checkJson finds missing scrambles', () => {
  let wcaCompetitionJson = {
    events: [
      {
        id: "333",
        rounds: [
          {
            id: "333-r1",
            format: "",
            scrambleSets: [],
          },
          {
            id: "333-r2",
            format: "a",
            scrambleSets: [
              {
                id: "333-r2-set1",
                scrambles: [ "1", "2", "3" ],
                extraScrambles: [ "E1", "E2" ],
              },
            ],
          },
          {
            id: "333-r3",
            format: "a",
            scrambleSets: [
              {
                id: "333-r3-set1",
                scrambles: [ "1", "2", "3", "4", "5" ],
                extraScrambles: [ "E1", "E2" ],
              },
            ],
          },
          {
            id: "333-r4",
            format: "a",
            scrambleSetCount: 2,
            scrambleSets: [
              {
                id: "333-r4-set1",
                scrambles: [ "1", "2", "3", "4", "5" ],
                extraScrambles: [ "E1", "E2" ],
              },
            ],
          },
        ],
      },
      {
        id: "222",
        rounds: [
          {
            id: "222-r1",
            format: "a",
            scrambleSets: [],
          },
          {
            id: "222-r2",
            format: "a",
            scrambleSets: null,
          },
        ],
      },
      {
        id: "333mbf",
        rounds: [
          {
            id: "333mbf-r1",
            format: "2",
            scrambleSets: null,
          },
        ],
      },
    ],
  };

  let checked = checkJson(normalizeCompetitionJson(wcaCompetitionJson));

  expect(checked).toEqual({
    currentScrambleCount: 19,
    scramblesNeededCount: 6*(5+2) + 2,
    finishedRounds: [
      {
        id: "333-r3",
      },
    ],
    setsWithWrongNumberOfScrambles: [
      {
        id: "333-r2-set1",
        scrambleCount: 3,
        requiredScrambleCountPerSet: 5,
      },
    ],
    roundsWithMissingSets: [
      {
        id: "333-r4",
        scrambleSetCount: 1,
        correctScrambleSetCount: 2,
      },
      {
        id: "222-r1",
        scrambleSetCount: 0,
        correctScrambleSetCount: 1,
      },
      {
        id: "222-r2",
        scrambleSetCount: 0,
        correctScrambleSetCount: 1,
      },
      {
        id: "333mbf-r1",
        scrambleSetCount: 0,
        correctScrambleSetCount: 1,
      },
    ],
    warnings: [
      {
        id: "333-r1",
        message: "Missing or invalid format",
      },
    ],
  });
});

describe('parseActivityCode and buildActivityCode', () => {
  it('333 round 1', () => {
    let activityCode = "333-r1";
    let parsed = { eventId: "333", roundNumber: 1 };
    expect(parseActivityCode(activityCode)).toEqual(parsed);
    expect(buildActivityCode(parsed)).toEqual(activityCode);
  });

  it('333 round 1 group A', () => {
    let activityCode = "333-r1-gA";
    let parsed = { eventId: "333", roundNumber: 1, group: "A" };
    expect(parseActivityCode(activityCode)).toEqual(parsed);
    expect(buildActivityCode(parsed)).toEqual(activityCode);
  });

  it('333 group A', () => {
    let activityCode = "333-gA";
    let parsed = { eventId: "333", group: "A" };
    expect(parseActivityCode(activityCode)).toEqual(parsed);
    expect(buildActivityCode(parsed)).toEqual(activityCode);
  });
});

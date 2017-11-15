import {
  checkScrambles,
  normalizeCompetitionJson,
  getNextAvailableGroupName,
  getNextGroupName,
  parseActivityCode,
  buildActivityCode,
} from 'WcaCompetitionJson';

it('checkScrambles finds missing scrambles', () => {
  let wcaCompetitionJson = {
    events: [
      {
        id: "333",
        rounds: [
          {
            id: "333-r1",
            format: "",
            groups: [],
          },
          {
            id: "333-r2",
            format: "a",
            groups: [
              {
                group: "A",
                scrambles: [ "1", "2", "3" ],
              },
            ],
          },
          {
            id: "333-r3",
            format: "a",
            groups: [
              {
                group: "A",
                scrambles: [ "1", "2", "3", "4", "5" ],
              },
            ],
          },
          {
            id: "333-r4",
            format: "a",
            plannedGroupCount: 2,
            groups: [
              {
                group: "A",
                scrambles: [ "1", "2", "3", "4", "5" ],
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
            groups: [],
          },
          {
            id: "222-r2",
            format: "a",
            groups: null,
          },
        ],
      },
    ],
  };

  let checkedScrambles = checkScrambles(normalizeCompetitionJson(wcaCompetitionJson));

  expect(checkedScrambles).toEqual({
    finishedRounds: [
      {
        id: "333-r3",
        groupCount: 1,
        plannedGroupCount: 1,
      },
    ],
    groupsWithWrongNumberOfScrambles: [
      {
        id: "333-r2-gA",
        scrambleCount: 3,
        requiredScrambleCount: 5,
      },
    ],
    roundsWithMissingGroups: [
      {
        id: "333-r4",
        groupCount: 1,
        plannedGroupCount: 2,
      },
      {
        id: "222-r1",
        groupCount: 0,
        plannedGroupCount: 1,
      },
      {
        id: "222-r2",
        groupCount: 0,
        plannedGroupCount: 1,
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

describe('getNextAvailableGroupName', () => {
  it('starts with "A"', () => {
    expect(getNextAvailableGroupName([])).toEqual("A");
  });

  it('moves on to "B"', () => {
    expect(getNextAvailableGroupName(["A"])).toEqual("B");
  });

  it('moves on to "B" even if "C" is taken', () => {
    expect(getNextAvailableGroupName(["C", "A"])).toEqual("B");
  });
});

describe('getNextGroupName', () => {
  it('moves on to "AA" after "Z"', () => {
    expect(getNextGroupName("Z")).toEqual("AA");
  });

  it('moves on to "BA" after "AZ"', () => {
    expect(getNextGroupName("AZ")).toEqual("BA");
  });

  it('moves on to "AAA" after "ZZ"', () => {
    expect(getNextGroupName("ZZ")).toEqual("AAA");
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

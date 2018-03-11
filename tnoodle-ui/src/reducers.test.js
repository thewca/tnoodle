import 'mock-localStorage';
import { combineReducers } from 'redux';

import * as actions from 'actions';
import * as reducers from 'reducers';

let rootReducer = combineReducers(reducers);

it('SCRAMBLE_SET_FOR_ROUND', () => {
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
                id: "333-r1-set1",
                scrambles: [ "1", "2", "3" ],
                extraScrambles: [ "E1" ],
              },
            ],
          },
        ],
      },
    ],
  };

  let state = {
    competitionJson: wcaCompetitionJson,
  };

  let nextState = rootReducer(state, {
    type: "SCRAMBLE_SET_FOR_ROUND",
    activityCode: "333-r1",
    scrambleSetId: "333-r1-set1",
    scrambles: [ "Scramble 1", "Scramble Dos" ],
    extraScrambles: [ "E1", "E2" ],
  });

  expect(nextState.competitionJson.events[0].rounds[0].scrambleSets).toEqual([{
    id: "333-r1-set1",
    scrambles: [ "Scramble 1", "Scramble Dos" ],
    extraScrambles: [ "E1", "E2" ],
  }]);
});

it('CLEAR_SCRAMBLES', () => {
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
                id: "333-r1-set1",
                scrambles: [ "1", "2", "3" ],
                extraScrambles: [ "E1" ],
              },
            ],
          },
        ],
      },
    ],
  };

  let state = {
    competitionJson: wcaCompetitionJson,
  };

  let nextState = rootReducer(state, {
    type: "CLEAR_SCRAMBLES",
  });

  expect(nextState.competitionJson.events[0].rounds[1].scrambleSets).toEqual([]);
});

import 'mock-localStorage';
import { combineReducers } from 'redux';

import * as actions from 'actions';
import * as reducers from 'reducers';

let rootReducer = combineReducers(reducers);

it('GROUP_FOR_ROUND', () => {
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
    type: "GROUP_FOR_ROUND",
    activityCode: "333-r1",
    groupName: "A",
    scrambles: [ "Scramble 1", "Scramble Dos" ],
    extraScrambles: [ "E1", "E2" ],
  });

  expect(nextState.competitionJson.events[0].rounds[0].groups).toEqual([{
    group: "A",
    scrambles: [ "Scramble 1", "Scramble Dos" ],
    extraScrambles: [ "E1", "E2" ],
  }]);
});

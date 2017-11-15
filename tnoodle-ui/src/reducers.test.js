import 'mock-localStorage';
import { combineReducers } from 'redux';

import * as actions from 'actions';
import * as reducers from 'reducers';

let rootReducer = combineReducers(reducers);

it('SET_PLANNED_GROUP_COUNT', () => {
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
                group: "a",
                scrambles: [ "1", "2", "3" ],
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

  let nextState = rootReducer(state, actions.setPlannedGroupCount('333-r1', 3));

  expect(nextState.competitionJson.events[0].rounds[0].plannedGroupCount).toEqual(3);
});

import 'mock-localStorage';
import { combineReducers } from 'redux';

import * as actions from 'actions';
import * as reducers from 'reducers';

let rootReducer = combineReducers(reducers);

it('SET_PLANNED_GROUP_COUNT', () => {
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
        ],
      },
    ],
  };

  let state = {
    competitionJson: wcaCompetitionJson,
  };

  let nextState = rootReducer(state, actions.setPlannedGroupCount('333-1', 3));

  expect(nextState.competitionJson.events[0].rounds[0].plannedGroupCount).toEqual(3);
});

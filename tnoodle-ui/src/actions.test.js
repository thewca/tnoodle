import 'mock-localStorage';
import thunk from 'redux-thunk';
import xhrMock from 'xhr-mock';
import * as actions from 'actions';
import * as reducers from 'reducers';
import configureMockStore from 'redux-mock-store';
import { normalizeCompetitionJson } from 'WcaCompetitionJson';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  beforeEach(() => xhrMock.setup());
  afterEach(() => xhrMock.teardown());

  it('generateMissingScrambles', () => {
    xhrMock.get("http://localhost:2014/scramble/.json?=333*7&showIndices=0", (req, res) => {
      return res
        .status(200)
        .header('Content-Type', 'application/json')
        .body(JSON.stringify([{ scrambles: ['S1', 'S2', 'S3', 'S4', 'S5', 'E1', 'E2'] }]))
      ;
    });

    let rounds = [
      {
        id: "333-r1",
        format: "a",
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
    ];
    let wcaCompetitionJson = {
      events: [
        {
          id: "333",
          rounds,
        },
      ],
    };

    const expectedActions = [
      {
        type: 'GENERATE_MISSING_SCRAMBLES',
        rounds,
      },
      {
        type: 'GROUP_FOR_ROUND',
        activityCode: "333-r1",
        groupName: "A",
        scrambles: [ "S1", "S2", "S3", "S4", "S5" ],
        extraScrambles: [ "E1", "E2" ],
      },
    ];
    const store = mockStore({ competitionJson: normalizeCompetitionJson(wcaCompetitionJson) });

    store.dispatch(actions.generateMissingScrambles(wcaCompetitionJson.events[0].rounds));

    // This setTimeout is a quick hack to wait for our async thunks to run.
    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

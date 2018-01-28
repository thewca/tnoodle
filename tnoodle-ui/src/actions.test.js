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

    let twentyMbfScrambles1 = [...Array(20).keys()].map(i => `Attempt-1.${i}`);
    let twentyMbfScrambles2 = [...Array(20).keys()].map(i => `Attempt-2.${i}`);
    xhrMock.get("http://localhost:2014/scramble/.json?=333ni*40&showIndices=1", (req, res) => {
      return res
        .status(200)
        .header('Content-Type', 'application/json')
        .body(JSON.stringify([{ scrambles: twentyMbfScrambles1.concat(twentyMbfScrambles2) }]))
      ;
    });

    // Catch any unexpected API calls.
    xhrMock.get(new RegExp("http://localhost:2014/*"), (req, res) => {
      console.error(`Not mocked: ${req.method()} ${req.url()}`);
      return res.status(500);
    });

    let wcaCompetitionJson = {
      events: [
        {
          id: "333",
          rounds: [
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
          ],
        },
        {
          id: "333mbf",
          rounds: [
            {
              id: "333mbf-r1",
              format: "2",
              groups: [],
            },
          ],
        },
      ],
    };

    let rounds = [].concat(...wcaCompetitionJson.events.map(wcifEvent => wcifEvent.rounds));
    const expectedActions = [
      {
        type: 'GENERATE_MISSING_SCRAMBLES',
      },
      {
        type: 'GROUP_FOR_ROUND',
        activityCode: "333-r1",
        groupName: "A",
        scrambles: [ "S1", "S2", "S3", "S4", "S5" ],
        extraScrambles: [ "E1", "E2" ],
      },
      {
        type: 'GROUP_FOR_ROUND',
        activityCode: "333mbf-r1",
        groupName: "A",
        scrambles: [
          twentyMbfScrambles1.join("\n"),
          twentyMbfScrambles2.join("\n"),
        ],
        extraScrambles: [],
      },
    ];
    const store = mockStore({
      competitionJson: normalizeCompetitionJson(wcaCompetitionJson),
      puzzlesPer333mbfAttempt: 20,
    });

    store.dispatch(actions.generateMissingScrambles());

    // This setTimeout is a quick hack to wait for our async thunks to run.
    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

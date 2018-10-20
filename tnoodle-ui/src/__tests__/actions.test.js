import '../utils/mock-localStorage';
import xhrMock from 'xhr-mock';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import * as actions from '../redux/actions/actions';
import { normalizeCompetitionJson } from '../utils/WcaCompetitionJson';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  beforeEach(() => xhrMock.setup());
  afterEach(() => xhrMock.teardown());

  it('generateMissingScrambles', () => {
    xhrMock.get(
      'http://localhost:2014/scramble/.json?=333*7&showIndices=0',
      (req, res) => {
        return res
          .status(200)
          .header('Content-Type', 'application/json')
          .body(
            JSON.stringify([
              { scrambles: ['S1', 'S2', 'S3', 'S4', 'S5', 'E1', 'E2'] }
            ])
          );
      }
    );

    let twentyMbfScrambles1 = [...Array(20).keys()].map(i => `Attempt-1.${i}`);
    let twentyMbfScrambles2 = [...Array(20).keys()].map(i => `Attempt-2.${i}`);
    xhrMock.get(
      'http://localhost:2014/scramble/.json?=333ni*40&showIndices=1',
      (req, res) => {
        return res
          .status(200)
          .header('Content-Type', 'application/json')
          .body(
            JSON.stringify([
              { scrambles: twentyMbfScrambles1.concat(twentyMbfScrambles2) }
            ])
          );
      }
    );

    // Catch any unexpected API calls.
    xhrMock.get(new RegExp('http://localhost:2014/*'), (req, res) => {
      console.error(`Not mocked: ${req.method()} ${req.url()}`);
      return res.status(500);
    });

    let wcaCompetitionJson = {
      events: [
        {
          id: '333',
          rounds: [
            {
              id: '333-r1',
              format: 'a',
              scrambleSets: []
            },
            {
              id: '333-r2',
              format: 'a',
              scrambleSets: [
                {
                  id: '333-r2-set1',
                  scrambles: ['1', '2', '3']
                }
              ]
            }
          ]
        },
        {
          id: '333mbf',
          rounds: [
            {
              id: '333mbf-r1',
              format: '2',
              scrambleSets: []
            }
          ]
        }
      ]
    };

    let rounds = [].concat(
      ...wcaCompetitionJson.events.map(wcifEvent => wcifEvent.rounds)
    );
    const expectedActions = [
      {
        type: 'GENERATE_MISSING_SCRAMBLES'
      },
      {
        type: 'SCRAMBLE_SET_FOR_ROUND',
        activityCode: '333-r1',
        scrambleSetId: '333-r1-set1',
        scrambles: ['S1', 'S2', 'S3', 'S4', 'S5'],
        extraScrambles: ['E1', 'E2']
      },
      {
        type: 'SCRAMBLE_SET_FOR_ROUND',
        activityCode: '333mbf-r1',
        scrambleSetId: '333mbf-r1-set1',
        scrambles: [
          twentyMbfScrambles1.join('\n'),
          twentyMbfScrambles2.join('\n')
        ],
        extraScrambles: []
      }
    ];
    const store = mockStore({
      competitionJson: normalizeCompetitionJson(wcaCompetitionJson),
      puzzlesPer333mbfAttempt: 20
    });

    store.dispatch(actions.generateMissingScrambles());

    // This setTimeout 10 is a dirty hack to wait for our async thunks and promises to run.
    // I don't know what the right way is to wait for all aynchronous work to finish in node/browser js.
    return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

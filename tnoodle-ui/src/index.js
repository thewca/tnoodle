import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';

import * as reducers from 'reducers';
import * as WcaApi from 'WcaApi';
import Home from 'Home';
import ManageCompetition from 'ManageCompetition';

const history = createHistory();

const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer,
  }),
  composeWithDevTools(applyMiddleware(middleware, thunk)),
);

ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="/" component={Home} />
        <Route path="/oauth/wca" render={() => <Redirect to={WcaApi.getPreLoginPath()} />} />
        <Route path="/competitions/:competitionId" component={ManageCompetition} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);

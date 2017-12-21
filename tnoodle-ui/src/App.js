import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';

import Home from 'Home';
import Layout from 'Layout';
import * as reducers from 'reducers';
import ManageCompetition from 'ManageCompetition';
import SelectCompetition from 'SelectCompetition';

export const BASE_PATH = process.env.PUBLIC_URL || "/scramble";

const history = createHistory({
  basename: BASE_PATH,
});

const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer,
  }),
  composeWithDevTools(applyMiddleware(middleware, thunk)),
);

const wrapWithTitle = function(Tag, propsToTitle) {
  return class extends Component {
    componentWillMount() {
      document.title = propsToTitle(this.props);
    }

    render() {
      return <Tag {...this.props} />;
    }
  };
};

export class NavigationAwareComponent extends Component {
  componentWillMount() {
    this.unblock = history.block(() => this.props.willNavigateAway());
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }

  beforeunload(e) {
    let message = this.props.willNavigateAway();
    if(message) {
      e.returnValue = message;
    }
  }

  componentWillUnmount() {
    this.unblock();
    window.removeEventListener('beforeunload', this.beforeunload);
  }

  render() {
    return null;
  }
}

export const App = function() {
  return (
    <Provider store={store}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        <Layout>
          <Route exact path="/" component={wrapWithTitle(Home, () => 'TNoodle')} />
          <Route exact path="/competitions/" component={wrapWithTitle(SelectCompetition, () => "Select a competition")} />
          <Route path="/competitions/:competitionId" component={wrapWithTitle(ManageCompetition, props => `${props.match.params.competitionId} | TNoodle`)} />
        </Layout>
      </ConnectedRouter>
    </Provider>
  );
};

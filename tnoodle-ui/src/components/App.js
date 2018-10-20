import { Provider } from 'react-redux';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

import Home from './Home';
import history from '../history';
import Layout from './Layout/Layout';
import getStore from '../redux/store';
import ManageCompetition from './ManageCompetition/ManageCompetition';
import SelectCompetition from './SelectCompetition/SelectCompetition';

export const BASE_PATH = process.env.PUBLIC_URL;

const store = getStore({}, history);

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
    if (message) {
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
      {/* ConnectedRouter will use the store from Provider automatically */}
      <ConnectedRouter history={history}>
        <Layout>
          <Switch>
            <Route
              exact
              path="/"
              component={wrapWithTitle(Home, () => 'TNoodle')}
            />
            <Route
              exact
              path="/competitions/"
              component={wrapWithTitle(
                SelectCompetition,
                () => 'Select a competition'
              )}
            />
            <Route
              path="/competitions/:competitionId"
              component={wrapWithTitle(
                ManageCompetition,
                props => `${props.match.params.competitionId} | TNoodle`
              )}
            />
            <Route component={NoMatch} />
          </Switch>
        </Layout>
      </ConnectedRouter>
    </Provider>
  );
};

const NoMatch = ({ location }) => (
  <div>
    <h3>
      No match for <code>{location.pathname}</code>
    </h3>
  </div>
);

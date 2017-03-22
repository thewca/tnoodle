import React, { Component } from 'react';
import classNames from 'classnames';

import * as WcaApi from 'WcaApi';
import ManageCompetition from 'ManageCompetition';

import 'App.css';
import logo from 'tnoodle_logo.svg';

function Layout({ me, busy, children }) {
  return (
    <div className="app">
      <div className="app-header">
        <img src={logo} className={classNames("app-logo", { busy })} alt="TNoodle logo" />
        {me ? <h2>Welcome to TNoodle, {me.name}!</h2> : <h2>Welcome to TNoodle!</h2>}
        <small>(If you're offline or not generating scrambles for an official WCA competition, use the <a href="/scramble/">legacy ui</a>.)</small>
      </div>
      <div className="app-into">
        {me ? children : (
          <p>
            To get started, <a href={WcaApi.logInUrl}>log in with the WCA</a>.
          </p>
        )}
      </div>
    </div>
  );
}

class SelectAndManageCompetition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitions: [],
    };
  }

  componentWillMount() {
    WcaApi.getUpcomingManageableCompetitions().then(competitions => {
      this.setState({ competitions });
    });
  }

  render() {
    return (
      <div>
        <select value={this.state.selectedCompetitionId} onChange={e => this.setState({ selectedCompetitionId: e.target.value })}>
          <option value="" >Select a competition to manage</option>
          <option disabled>-----</option>
          {this.state.competitions.map(competition => {
            return (
              <option key={competition.id} value={competition.id}>{competition.id}</option>
            );
          })}
        </select>

        {this.state.selectedCompetitionId && <ManageCompetition competitionId={this.state.selectedCompetitionId} />}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    WcaApi.me().then(me => {
      this.setState({ me });
    });
  }

  render() {
    let me = this.state.me;
    return (
      <Layout me={me} busy={false}>
        <SelectAndManageCompetition />
      </Layout>
    );
  }
}

export default App;

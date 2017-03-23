import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Layout from 'Layout';
import * as WcaApi from 'WcaApi';

class SelectCompetition extends Component {
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
        <h2>Select a competition to manage</h2>
        <ul>
          {this.state.competitions.map(competition => {
            return (
              <li key={competition.id}>
                <Link to={`/competitions/${competition.id}`}>{competition.id}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default function() {
  return (
    <Layout>
      <SelectCompetition />
    </Layout>
  );
};

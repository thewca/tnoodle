import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toWcaUrl } from 'WcaApi';

import Layout from 'Layout';
import * as actions from 'actions';

class SelectCompetition extends Component {
  render() {
    let competitions = this.props.competitions;
    return (
      <div>
        <h2>Select a competition to manage</h2>
        {competitions.length === 0 ? (
          <span>
            No competitions found, are you sure you have upcoming competitions?
            Try checking <a href={toWcaUrl("/competitions/mine")} target="_blank">on the WCA website</a>.
          </span>
        ) : (
          <ul>
            {competitions.map(competition => {
              return (
                <li key={competition.id}>
                  <Link to={`/competitions/${competition.id}`}>{competition.id}</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      competitions: state.upcomingManageableCompetitions,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(actions.fetchUpcomingManageableCompetitions());
    }

    render() {
      return (
        <Layout>
          {this.props.competitions && <SelectCompetition competitions={this.props.competitions} />}
        </Layout>
      );
    }
  }
);

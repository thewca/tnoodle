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
      <div className="competitions-picker">
        <h2 className="text-center mt-5">Select an upcoming competition:</h2>
        {competitions.length === 0 ? (
          <span>
            No competitions found, are you sure you have upcoming competitions?
            Try checking <a href={toWcaUrl("/competitions/mine")} target="_blank">on the WCA website</a>.
          </span>
        ) : (
          <div className="list-group m-auto">
            {competitions.map(competition => {
              return (
                <Link key={competition.id} to={`/competitions/${competition.id}`} className="list-group-item list-group-item-action">{competition.id}</Link>
              );
            })}
          </div>
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

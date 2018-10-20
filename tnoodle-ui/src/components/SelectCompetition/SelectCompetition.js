import { toWcaUrl } from '../../api/WcaApi';
import * as actions from '../../redux/actions/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PreserveSearchLink from '../PreserveSearchLink';

export default connect(state => {
  return {
    competitions: state.upcomingManageableCompetitions
  };
})(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(actions.fetchUpcomingManageableCompetitions());
    }

    render() {
      let competitions = this.props.competitions;
      if (!competitions) {
        return 'Loading competitions';
      }
      return (
        <div className="competitions-picker">
          <h2 className="text-center">Select an upcoming competition:</h2>
          {competitions.length === 0 ? (
            <div className="text-center">
              No competitions found, are you sure you have upcoming
              competitions? Try checking{' '}
              <a href={toWcaUrl('/competitions/mine')} target="_blank">
                on the WCA website
              </a>
              .
            </div>
          ) : (
            <div className="list-group">
              {competitions.map(competition => {
                return (
                  <PreserveSearchLink
                    key={competition.id}
                    to={`/competitions/${competition.id}`}
                    className="list-group-item list-group-item-action"
                  >
                    {competition.name}
                  </PreserveSearchLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  }
);

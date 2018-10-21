import _ from 'lodash';
import React, { Component } from 'react';
import { toWcaUrl } from '../../api/WcaApi';
import PreserveSearchLink from '../PreserveSearchLink';

export default class SelectCompetition extends Component {
  componentDidMount = () => {
    this.props.fetchUpcomingManageableCompetitions();
  };

  render() {
    const { competitions } = this.props;
    if (!competitions) {
      return 'Loading competitions...';
    }
    return (
      <div className="competitions-picker">
        <h2 className="text-center">Select an upcoming competition:</h2>
        {_.size(competitions) === 0 ? (
          <div className="text-center">
            No competitions found, are you sure you have upcoming competitions?
            Try checking{' '}
            <a href={toWcaUrl('/competitions/mine')} target="_blank">
              on the WCA website
            </a>
            .
          </div>
        ) : (
          <div className="list-group">
            {_.map(competitions, competition => (
              <PreserveSearchLink
                key={competition.id}
                to={`/competitions/${competition.id}`}
                className="list-group-item list-group-item-action"
                children={competition.name}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

import { connect } from 'react-redux';
import React, { Component } from 'react';

import events from 'wca/events';
import pluralize from 'pluralize';
import { toWcaUrl } from 'WcaApi';
import * as actions from 'actions';
import CubingIcon from 'CubingIcon';
import { NavigationAwareComponent } from 'App';
import { fetchCompetitionJson } from 'actions';
import { checkScrambles } from 'WcaCompetitionJson';

import FaEye from 'react-icons/lib/fa/eye';
import FaEyeSlash from 'react-icons/lib/fa/eye-slash';

class ManageCompetition extends Component {
  constructor() {
    super();
    this.state = {
      scramblePassword: '',
      showScramblePassword: false,
    };
  }

  render() {
    let { competitionJson, dispatch } = this.props;
    if(!competitionJson) {
      return (
        <div>Loading competition...</div>
      );
    }

    let { groupsWithWrongNumberOfScrambles, roundsWithMissingGroups, warnings, scramblesNeededCount, currentScrambleCount } = checkScrambles(competitionJson);

    let groupsWithWrongNumberOfScramblesDiv = null;
    if(groupsWithWrongNumberOfScrambles.length > 0) {
      groupsWithWrongNumberOfScramblesDiv = (
        <div>
          <h2>Groups with wrong number of scrambles</h2>
          <pre>{JSON.stringify(groupsWithWrongNumberOfScrambles, null, 2)}</pre>
        </div>
      );
    }

    let warningsDiv = null;
    if(warnings.length > 0) {
      warningsDiv = (
        <div>
          <h2>Warnings</h2>
          <ul>
            {warnings.map(warning => {
              return (
                <li key={warning.id}>
                  {warning.eventId} Round {warning.roundNumber}: {warning.message}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    let { showScramblePassword, scramblePassword } = this.state;
    let progress = currentScrambleCount / scramblesNeededCount;

    let generationArea;
    if(progress === 1) {
      generationArea = <button
          className="btn btn-block btn-lg btn-primary"
          onClick={e => dispatch(actions.downloadScrambles(e.shiftKey, scramblePassword))}
        >
        Download scrambles
      </button>;
    } else if(this.state.hasStartedGeneratingScrambles) {
      generationArea = <div className="progress scramble-generation">
        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: Math.max(5, progress*100) + "%"}}></div>
      </div>;
    } else {
      generationArea = <button
          className="btn btn-block btn-lg btn-primary"
          onClick={() => {
            dispatch(actions.generateMissingScrambles(roundsWithMissingGroups));
            this.setState({ hasStartedGeneratingScrambles: true });
          }}
        >
        Generate {pluralize('scramble', scramblesNeededCount, true)} for {competitionJson.id}
      </button>;
    }

    return (
      <div className="manage-competition">
        <p>
          Found {pluralize('event', competitionJson.events.length, true)} for {competitionJson.id}.
        </p>
        <div className="text-center">
          {competitionJson.events.map(event => {
            let title = `${pluralize('round', event.rounds.length, true)} of ${events.byId[event.id].name}`;
            return <CubingIcon key={event.id} event={event.id} title={title} />
          })}
        </div>
        <p>
          You can view and change the rounds over on <a href={toWcaUrl(`/competitions/${competitionJson.id}/events/edit`)} target="_blank">the WCA website</a>. <strong>Refresh this page after making any changes on the WCA website.</strong>
        </p>

        <div className="form-group">
          <div className="input-group">
            <span
              className="input-group-addon pointer"
              title={showScramblePassword ? "Hide password" : "Show password"}
              onClick={() => this.setState({ showScramblePassword: !showScramblePassword })}
            >
              {showScramblePassword ? <FaEye /> : <FaEyeSlash />}
            </span>
            <input
              type={showScramblePassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={scramblePassword}
              onChange={e => this.setState({ scramblePassword: e.target.value })}
            />
          </div>
        </div>

        {generationArea}

        {groupsWithWrongNumberOfScramblesDiv}
        {warningsDiv}
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    return {
      competitionId: ownProps.match.params.competitionId,
      competitionJson: state.competitionJson,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(fetchCompetitionJson(this.props.competitionId));
    }

    willNavigateAway() {
      return "Any scrambles you've gnerated will disappear when you navigate away."
    }

    render() {
      let { competitionJson, dispatch } = this.props;
      return <div className="container">
        <NavigationAwareComponent willNavigateAway={this.willNavigateAway.bind(this)} />
        <ManageCompetition competitionJson={competitionJson} dispatch={dispatch} />
      </div>;
    }
  }
);

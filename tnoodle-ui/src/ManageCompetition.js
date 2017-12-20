import React, { Component } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import Layout from 'Layout';
import * as actions from 'actions';
import { checkScrambles } from 'WcaCompetitionJson';
import { fetchCompetitionJson } from 'actions';
import { NavigationAwareComponent } from 'App';

function RoundInfo({ round, dispatch }) {
  return (
    <div>
      {round.id} has {pluralize('group', round.groupCount, true)} generated
      out of a planned {round.scrambleGroupCount}.
    </div>
  );
}

function RoundList({ rounds, dispatch }) {
  return (
    <ul>
      {rounds.map(round => {
        return (
          <li key={round.id}>
            <RoundInfo round={round} dispatch={dispatch} />
          </li>
        );
      })}
    </ul>
  );
}

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

    let { finishedRounds, groupsWithWrongNumberOfScrambles, roundsWithMissingGroups, warnings } = checkScrambles(competitionJson);

    let finishedRoundsDiv = null;
    if(finishedRounds.length > 0) {
      finishedRoundsDiv = (
        <div>
          <h2>Found {pluralize('round', finishedRounds.length, true)} with groups</h2>
          <RoundList rounds={finishedRounds} dispatch={dispatch} />
        </div>
      );
    }

    let groupsWithWrongNumberOfScramblesDiv = null;
    if(groupsWithWrongNumberOfScrambles.length > 0) {
      groupsWithWrongNumberOfScramblesDiv = (
        <div>
          <h2>Groups with wrong number of scrambles</h2>
          <pre>{JSON.stringify(groupsWithWrongNumberOfScrambles, null, 2)}</pre>
        </div>
      );
    }

    let roundsWithMissingGroupsDiv = null;
    if(roundsWithMissingGroups.length > 0) {
      roundsWithMissingGroupsDiv = (
        <div>
          <h2>Rounds with missing groups</h2>
          <button onClick={() => dispatch(actions.generateMissingScrambles(roundsWithMissingGroups))}>
            Generate all missing groups
          </button>
          <RoundList rounds={roundsWithMissingGroups} dispatch={dispatch} />
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

    let promptClearScrambles = function() {
      if(window.confirm("Are you sure you want to clear all the scrambles already generated for this competition?")) {
        dispatch(actions.clearCompetitionScrambles(competitionJson));
      }
    };

    return (
      <div>
        <button onClick={promptClearScrambles}>Clear scrambles</button>
        <input
          type={this.state.showScramblePassword ? "text" : "password"}
          placeholder="Password"
          value={this.state.scramblePassword}
          onChange={e => this.setState({ scramblePassword: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            value={this.state.showScramblePassword}
            onChange={e => this.setState({ showScramblePassword: e.target.checked })}
          />
          Show password
        </label>
        <button
          onClick={e => dispatch(actions.downloadScrambles(e.shiftKey, this.state.scramblePassword))}
        >
          Download scramble zip
        </button>

        {finishedRoundsDiv}
        {groupsWithWrongNumberOfScramblesDiv}
        {roundsWithMissingGroupsDiv}
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
      originalCompetitionJsonAndHash: state.originalCompetitionJsonAndHash,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(fetchCompetitionJson(this.props.competitionId));
    }

    willNavigateAway() {
      let { originalCompetitionJsonAndHash, competitionJson } = this.props;
      if(JSON.stringify(originalCompetitionJsonAndHash.json) !== JSON.stringify(competitionJson)) {
        return "You have unsaved changes to this competition. Are you sure you want to navigate away?";
      }
    }

    render() {
      let { competitionJson, originalCompetitionJsonAndHash, dispatch } = this.props;
      return (
        <Layout>
          <NavigationAwareComponent willNavigateAway={this.willNavigateAway.bind(this)} />
          <ManageCompetition competitionJson={competitionJson} originalCompetitionJsonAndHash={originalCompetitionJsonAndHash} dispatch={dispatch} />
        </Layout>
      );
    }
  }
);

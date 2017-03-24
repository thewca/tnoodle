import React, { Component } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import Layout from 'Layout';
import * as actions from 'actions';
import { checkScrambles, buildActivityCode } from 'WcaCompetitionJson';
import { fetchCompetitionJson } from 'actions';

function RoundInfo({ round, dispatch }) {
  let activityCode = buildActivityCode(round);
  return (
    <div>
      {round.eventId} Round {round.nthRound} has {pluralize('group', round.groupCount, true)} generated
      out of a planned <input type="number" value={round.plannedGroupCount} onChange={(e) => {
        dispatch(actions.setPlannedGroupCount(activityCode, parseInt(e.target.value, 10)));
      }} />.
    </div>
  );
}

function RoundList({ rounds, dispatch }) {
  return (
    <ul>
      {rounds.map(round => {
        let activityCode = buildActivityCode(round);
        return (
          <li key={activityCode}>
            <RoundInfo round={round} dispatch={dispatch} />
          </li>
        );
      })}
    </ul>
  );
}

function ManageCompetition({ competitionJson, originalCompetitionJson, dispatch }) {
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
            let activityCode = buildActivityCode(warning);
            return (
              <li key={activityCode}>
                {warning.eventId} Round {warning.nthRound}: {warning.message}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  let enableSaveButton = JSON.stringify(originalCompetitionJson) !== JSON.stringify(competitionJson);

  return (
    <div>
      {<button disabled={!enableSaveButton} onClick={() => dispatch(actions.saveCompetitionJson(competitionJson))}>Save</button>}
      {finishedRoundsDiv}
      {groupsWithWrongNumberOfScramblesDiv}
      {roundsWithMissingGroupsDiv}
      {warningsDiv}
    </div>
  );
}

export default connect(
  (state, ownProps) => {
    return {
      competitionId: ownProps.match.params.competitionId,
      competitionJson: state.competitionJson,
      originalCompetitionJson: state.originalCompetitionJson,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(fetchCompetitionJson(this.props.competitionId));
    }

    render() {
      let { competitionJson, originalCompetitionJson, dispatch } = this.props;
      return (
        <Layout busy={false}>
          <ManageCompetition competitionJson={competitionJson} originalCompetitionJson={originalCompetitionJson} dispatch={dispatch} />
        </Layout>
      );
    }
  }
);

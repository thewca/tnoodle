import React, { Component } from 'react';
import { connect } from 'react-redux';

import Layout from 'Layout';
import { checkScrambles } from 'WcaCompetitionJson';
import { fetchCompetitionJson } from 'actions';

function buildActivityCode(issue) {
  return [ issue.eventId, issue.nthRound, issue.group ].filter(el => el).join("-");
}

function ManageCompetition({ competitionJson }) {
  if(!competitionJson) {
    return (
      <div>Loading competition...</div>
    );
  }

  let { done, todo, warnings } = checkScrambles(competitionJson);

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Done</h2>
      <pre>{JSON.stringify(done, null, 2)}</pre>

      <h2>TODO</h2>
      <button>Generate all missing scrambles</button>
      <pre>{JSON.stringify(todo, null, 2)}</pre>

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

    render() {
      let { competitionJson } = this.props;
      return (
        <Layout>
          <ManageCompetition competitionJson={competitionJson} />
        </Layout>
      );
    }
  }
);

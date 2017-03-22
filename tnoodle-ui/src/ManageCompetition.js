import React, { Component } from 'react';
import * as WcaApi from 'WcaApi';
import { checkScrambles } from 'WcaCompetitionJson';

function buildActivityCode(issue) {
  return [ issue.eventId, issue.nthRound, issue.group ].filter(el => el).join("-");
}

export default class ManageCompetition extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.loadCompetition(this.props.competitionId);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.competitionId !== nextProps.competitionId) {
      this.loadCompetition(nextProps.competitionId);
    }
  }

  loadCompetition(competitionId) {
    WcaApi.getCompetitionJson(competitionId).then(competitionJson => {
      this.setState({ competitionJson });
    });
  }

  render() {
    if(!this.state.competitionJson) {
      return (
        <div>Loading competition...</div>
      );
    }

    let { done, todo, warnings } = checkScrambles(this.state.competitionJson);

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
}

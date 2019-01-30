import { connect } from 'react-redux';
import React, { Component } from 'react';

import events from 'wca/events';
import pluralize from 'pluralize';
import { toWcaUrl } from 'WcaApi';
import * as actions from 'actions';
import CubingIcon from 'CubingIcon';
import { NavigationAwareComponent } from 'App';
import { fetchCompetitionJson } from 'actions';
import { checkJson } from 'WcaCompetitionJson';

import FaEye from 'react-icons/lib/fa/eye';
import FaEyeSlash from 'react-icons/lib/fa/eye-slash';

class ManageCompetition extends Component {
  constructor() {
    super();
    this.state = {
      showScramblePassword: false,
    };
  }

  _renderMbldArea() {
    let {
      puzzlesPer333mbfAttempt,
      isGeneratingScrambles,
      isGeneratingZip,
      dispatch,
    } = this.props;

    return <React.Fragment>
      <p>
        This competition has {events.byId['333mbf'].name}. How many scrambles do you want for each attempt?
      </p>
      <p>
        <input
          type="number"
          placeholder="How many puzzles do you expect people to attempt?"
          disabled={isGeneratingScrambles || isGeneratingZip}
          className="form-control"
          value={puzzlesPer333mbfAttempt}
          ref={input => this.puzzlesPerMbfAttemptInput = input}
          onChange={e => dispatch(actions.setPuzzlesPer333mbfAttempt(e.target.value))}
        />
      </p>
    </React.Fragment>;
  }

  render() {
    let {
      competitionJson,
      loadCompetitionJsonError,
      scrambleZip,
      scramblePassword,
      puzzlesPer333mbfAttempt,
      isGeneratingScrambles,
      isGeneratingZip,
      dispatch,
    } = this.props;
    if(loadCompetitionJsonError) {
      return (
        <div>Error while loading competition! <code>{loadCompetitionJsonError.message}</code></div>
      );
    } else if(!competitionJson) {
      return (
        <div>Loading competition...</div>
      );
    }

    let { setsWithWrongNumberOfScrambles, warnings, scramblesNeededCount, currentScrambleCount } = checkJson(competitionJson);

    let setsWithWrongNumberOfScramblesDiv = null;
    if(setsWithWrongNumberOfScrambles.length > 0) {
      setsWithWrongNumberOfScramblesDiv = (
        <div>
          <h2>Scramble sets with wrong number of scrambles</h2>
          <pre>{JSON.stringify(setsWithWrongNumberOfScrambles, null, 2)}</pre>
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

    let { showScramblePassword } = this.state;
    let progress = currentScrambleCount / scramblesNeededCount;
    let hasMbld = competitionJson.events.find(event => event.id === '333mbf');

    let generationArea;
    if(scrambleZip) {
      generationArea = <a
          className="btn btn-block btn-lg btn-primary"
          download={scrambleZip.title + ".zip"}
          href={scrambleZip.url}
          onClick={e => {
            if(e.shiftKey) {
              e.preventDefault();
              dispatch(actions.downloadScrambles({ pdf: true, password: scramblePassword }));
            }
          }}
        >
        Download scrambles
      </a>;
    } else if(isGeneratingScrambles || isGeneratingZip) {
      generationArea = <div className="progress scramble-generation">
        <div className="progress-bar progress-bar-striped progress-bar-animated"
             style={{width: Math.max(5, progress*100) + "%"}}>
          {isGeneratingZip ? "Generating zip file..." : ""}
        </div>
      </div>;
    } else {
      let disabled, title;
      // perhaps we should set also an upper bound to avoid numbers like 2e3
      if(hasMbld && (!puzzlesPer333mbfAttempt || puzzlesPer333mbfAttempt < 2)) {
        disabled = true;
        title = `You must set a number of puzzles, at least 2, to generate scrambles for ${events.byId['333mbf'].name}.`;
      }
      generationArea = <button
          className="btn btn-block btn-lg btn-primary"
          disabled={disabled}
          title={title}
          onClick={() => {
            dispatch(actions.generateMissingScrambles());
          }}
        >
        Generate scrambles
      </button>;
    }

    return (
      <div className="manage-competition">
        <p>
          Found {pluralize('event', competitionJson.events.length, true)} for {competitionJson.name}.
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

        {hasMbld && this._renderMbldArea()}

        <div className="row scramble-form">
          <div className="col-6">
            <div className="form-group">
              <div className="input-group input-group-lg">
                <input
                  type={showScramblePassword ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isGeneratingScrambles || isGeneratingZip}
                  className="form-control"
                  placeholder="Password"
                  value={scramblePassword}
                  ref={input => this.passwordInput = input}
                  onChange={e => dispatch(actions.setScramblePassword(e.target.value))}
                />
                <span
                  className="input-group-addon pointer"
                  title={showScramblePassword ? "Hide password" : "Show password"}
                  onClick={() => {
                    this.passwordInput.focus();
                    this.setState({ showScramblePassword: !showScramblePassword })
                  }}
                >
                  {showScramblePassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>
          </div>

          <div className="col-6">
            {generationArea}
          </div>
        </div>

        {setsWithWrongNumberOfScramblesDiv}
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
      loadCompetitionJsonError: state.loadCompetitionJsonError,
      puzzlesPer333mbfAttempt: state.puzzlesPer333mbfAttempt,
      isGeneratingScrambles: state.isGeneratingScrambles,
      isGeneratingZip: state.isGeneratingZip,
      scrambleZip: state.scrambleZip,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(fetchCompetitionJson(this.props.competitionId));
    }

    willNavigateAway() {
      return "Any scrambles you've generated will disappear when you navigate away.";
    }

    render() {
      return <div className="container">
        <NavigationAwareComponent willNavigateAway={this.willNavigateAway.bind(this)} />
        <ManageCompetition {...this.props} />
      </div>;
    }
  }
);

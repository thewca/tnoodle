import * as WcaApi from 'WcaApi';
import * as actions from 'actions';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';

import 'Layout.css';
import logo from 'tnoodle_logo.svg';

export default connect(
  state => {
    return {
      me: state.me,
      versionInfo: state.versionInfo,
      errorMessage: state.errorMessage,
      ongoingPromises: Object.keys(state.ongoingPromises),
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(actions.fetchMe());
      this.props.dispatch(actions.fetchVersionInfo());
    }

    render() {
      let { me, versionInfo, errorMessage, ongoingPromises, children } = this.props;
      let busy = ongoingPromises.length > 0;

      let analyzedVersion = analyzeVersion(versionInfo);

      let title, contents;
      let logOutButton = <div></div>;
      if(me) {
        title = <h2>
          Welcome to TNoodle, {me.name}!
        </h2>;
        logOutButton = <button className="btn btn-outline-light pointer" onClick={() => WcaApi.logOut()}>
          Log out
        </button>;
        contents = children;
      } else {
        title = <h2>Welcome to TNoodle!</h2>;

        contents = (
          <div>
            <div className="d-flex justify-content-around mt-5">
              <a className="btn btn-outline-primary btn-home" href="/scramble-legacy/">Legacy UI</a>
              <button className="btn btn-outline-primary btn-home pointer" onClick={() => WcaApi.logIn()}>Log in with the WCA</button>
            </div>
          </div>
        );
      }
      return (
        <div className="app">
          <div className={classNames("app-header", { error: !!errorMessage, alarm: analyzedVersion.alarm })}>
            <img src={logo} className={classNames("app-logo", { busy })} title={errorMessage} alt="TNoodle logo" />
            {analyzedVersion.message ? analyzedVersion.message : title}
            {logOutButton}
          </div>
          <div className="app-intro">
            {contents}
          </div>
        </div>
      );
    }
  }
);

function analyzeVersion(versionInfo) {
  if(!versionInfo) {
    return {};
  }

  // For testing purposes, we let people fake the version of
  // TNoodle they're using.
  var runningVersion = new URLSearchParams(window.location.search).get('forceVersion') || versionInfo.running_version;

  if(versionInfo.ignorableError) {
    // There was an error connecting to the server or something.
    // Don't bother the user with this (it probably just means
    // they're offline), but we do log a message here.
    console.log("Ignorable error in checkVersion: " + versionInfo.ignorableError);
    return {};
  }
  var isAllowed = versionInfo.allowed.indexOf(runningVersion) >= 0;
  var isCurrent = runningVersion === versionInfo.current.name;
  var downloadCurrent = (<span><a href={versionInfo.current.download} target='_blank'>{versionInfo.current.name}</a> (<a href={versionInfo.current.information} target='_blank'>details</a>)</span>);
  if(isAllowed && isCurrent) {
    // There is nothing to do here
    return {};
  } else if(isAllowed && !isCurrent) {
    // There is an upgrade available, inform the user
    return {
      message: <div>
        You are running {runningVersion}, which is still allowed, but you should upgrade to {downloadCurrent};
      </div>,
      alarm: false,
    };
  } else if(!isAllowed && isCurrent) {
    // This should never happen. We're using the current version,
    // but the current version isn't allowed?
    throw new Error("Current version " + versionInfo.current.name + " not allowed " + versionInfo.allowed + " ???");
  } else if(!isAllowed && !isCurrent) {
    // The user must upgrade in order to generate legal scrambles.
    // Don't disable the UI, but make it very obvious that they're
    // using an unallowed version of TNoodle.
    return {
      message: <div>
        Scrambles generated with this version of TNoodle must not be used in competition.<br />
        <small>You are on version {runningVersion}, you must use {downloadCurrent}.</small>
      </div>,
      alarm: true,
    };
  } else {
    throw new Error();
  }
}

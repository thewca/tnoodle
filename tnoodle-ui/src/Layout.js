import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import 'Layout.css';
import logo from 'tnoodle_logo.svg';

import * as WcaApi from 'WcaApi';
import * as actions from 'actions';

export default connect(
  state => {
    return {
      me: state.me,
      errorMessage: state.errorMessage,
      ongoingPromises: Object.keys(state.ongoingPromises),
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(actions.fetchMe());
    }

    render() {
      let { me, errorMessage, ongoingPromises, children } = this.props;
      let busy = ongoingPromises.length > 0;

      let subtitle;
      if(me) {
        subtitle = (
          <h2>
            Welcome to TNoodle, {me.name}!
            <button onClick={() => WcaApi.logOut()}>
              Log out
            </button>
          </h2>
        );
      } else {
        subtitle = (
          <h2>Welcome to TNoodle!</h2>
        );
      }
      return (
        <div className="app">
          <div className={classNames("app-header", { error: !!errorMessage })}>
            <img src={logo} className={classNames("app-logo", { busy })} title={errorMessage} alt="TNoodle logo" />
            {subtitle}
            <small>(If you are offline or not generating scrambles for an official WCA competition, use the <a href="/scramble/">legacy ui</a>.)</small>
          </div>
          <div className="app-intro">
            {me ? children : (
              <p>
                To get started, <button onClick={() => WcaApi.logIn()}>log in with the WCA</button>.
              </p>
            )}
          </div>
        </div>
      );
    }
  }
);

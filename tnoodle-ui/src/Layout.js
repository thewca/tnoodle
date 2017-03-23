import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import 'index.css';
import logo from 'tnoodle_logo.svg';

import * as WcaApi from 'WcaApi';
import * as actions from 'actions';

export default connect(
  state => {
    return {
      me: state.me,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(actions.fetchMe());
    }

    render() {
      let { me, busy, children } = this.props;

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
          <div className="app-header">
            <img src={logo} className={classNames("app-logo", { busy })} alt="TNoodle logo" />
            {subtitle}
            <small>(If you are offline or not generating scrambles for an official WCA competition, use the <a href="/scramble/">legacy ui</a>.)</small>
          </div>
          <div className="app-into">
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

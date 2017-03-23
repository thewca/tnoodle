import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import 'index.css';
import logo from 'tnoodle_logo.svg';

import * as WcaApi from 'WcaApi';
import { fetchMe } from 'actions';

export default connect(
  state => {
    return {
      me: state.me,
    };
  },
)(
  class extends Component {
    componentWillMount() {
      this.props.dispatch(fetchMe());
    }

    render() {
      let { me, busy, children } = this.props;
      return (
        <div className="app">
          <div className="app-header">
            <img src={logo} className={classNames("app-logo", { busy })} alt="TNoodle logo" />
            {me ? <h2>Welcome to TNoodle, {me.name}!</h2> : <h2>Welcome to TNoodle!</h2>}
            <small>(If you are offline or not generating scrambles for an official WCA competition, use the <a href="/scramble/">legacy ui</a>.)</small>
          </div>
          <div className="app-into">
            {me ? children : (
              <p>
                To get started, <a href={WcaApi.logInUrl}>log in with the WCA</a>.
              </p>
            )}
          </div>
        </div>
      );
    }
  }
);

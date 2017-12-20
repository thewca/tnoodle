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

      let subtitle, contents;
      if(me) {
        subtitle = (
          <React.Fragment>
            <h2>
              Welcome to TNoodle, {me.name}!
            </h2>
            <button className="btn btn-outline-light pointer" onClick={() => WcaApi.logOut()}>
              Log out
            </button>
          </React.Fragment>
        );
        contents = children;
      } else {
        subtitle = (
          <React.Fragment>
            <h2>Welcome to TNoodle!</h2>
            <div></div>
          </React.Fragment>
        );

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
          <div className={classNames("app-header", { error: !!errorMessage })}>
            <img src={logo} className={classNames("app-logo", { busy })} title={errorMessage} alt="TNoodle logo" />
            {subtitle}
          </div>
          <div className="app-intro">
            {contents}
          </div>
        </div>
      );
    }
  }
);

import React, { Component } from "react";

import * as WcaApi from "../../functions/wca.api";

class OnlineScrambler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    if (!this.state.me) {
      return (
        <div className="container">
          <button
            className="btn btn-outline-primary btn-lg"
            onClick={WcaApi.logIn}
          >
            Log In
          </button>
        </div>
      );
    }
    return (
      <div className="container">
        <h1>Online Scrambler</h1>
      </div>
    );
  }
}

export default OnlineScrambler;

import React, { Component } from "react";

import SelectCompetition from "./SelectCompetition";

import * as WcaApi from "../../functions/wca.api";

class OnlineScrambler extends Component {
  constructor(props) {
    super(props);

    this.props.fetchMe();

    let me = this.props.me;
    this.state = { me: me, competitions: undefined };

    if (me != null) {
      WcaApi.getUpcomingManageableCompetitions().then(result => {
        let state = this.state;
        state.competitions = result;
        this.state = state;
      });
    }
  }
  render() {
    if (this.state.me == null) {
      return (
        <div>
          <h1>You have to login first</h1>
        </div>
      );
    }
    return (
      <div className="container">
        <h1>Welcome, {this.state.me.name}</h1>
        <SelectCompetition competitions={this.state.competitions} />
      </div>
    );
  }
}

export default OnlineScrambler;

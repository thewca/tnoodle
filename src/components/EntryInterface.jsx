import React, { Component } from "react";

import "./EntryInterface.scss";

class EntryInterface extends Component {
  constructor(props) {
    super(props);

    this.state = {
      competitionName: this.getDefaultCompetitionName(),
      password: ""
    };
  }

  getDefaultCompetitionName = () => {
    let date = new Date();
    return "Scrambles for " + date.toISOString().split("T")[0];
  };

  toogleShowPassword = () => {
    let state = this.state;
    state.showPassword = !state.showPassword;
    this.setState(state);
  };

  handleCompetitionName = event => {
    let state = this.state;
    state.competitionName = event.target.value;
    this.setState(state);
  };

  handlePassword = event => {
    let state = this.state;
    state.password = event.target.value;
    this.setState(state);
  };

  render() {
    return (
      <div className="container">
        <div className="row" id="entry-items">
          <div className="col-md-3 text-right">
            <p className="entry-spec">Competition Name: </p>
          </div>
          <div className="col-md-3">
            <input
              id="competitionName"
              placeholder="Competition Name"
              onChange={this.handleCompetitionName}
              value={this.state.competitionName}
              size={40}
            />
          </div>

          <div className="col-md-1"></div>

          <div className="col-md-3 text-right">
            <p className="entry-spec">Password:</p>
          </div>
          <div className="col-md-2">
            <input
              id="passwordInput"
              type={this.state.showPassword ? "" : "password"}
              placeholder="Password"
              onChange={this.handlePassword}
            />
            <div onClick={this.toogleShowPassword}>
              <input
                id="showPassword"
                type="checkbox"
                checked={this.state.showPassword}
                readOnly
              />
              <label>Show password</label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EntryInterface;

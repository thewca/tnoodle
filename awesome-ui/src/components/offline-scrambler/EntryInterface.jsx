import React, { Component } from "react";

class EntryInterface extends Component {
  constructor(props) {
    super(props);

    this.state = {
      competitionName: this.getDefaultCompetitionName(),
      password: "",
      showPassword: false
    };

    // Set initial competition name to the wcif
    props.handleCompetitionNameChange(this.state.competitionName);
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

  handleCompetitionNameChange = event => {
    let state = this.state;
    state.competitionName = event.target.value;
    this.setState(state);

    // Propagate the change.
    this.props.handleCompetitionNameChange(this.state.competitionName);
  };

  handlePasswordChange = event => {
    let state = this.state;
    state.password = event.target.value;
    this.setState(state);

    // Propagate the change.
    this.props.handlePasswordChange(this.state.password);
  };

  render() {
    return (
      <div className="container">
        <div className="row" id="entry-items">
          <div className="col-md-6 text-left form-group">
            <label className="font-weight-bold pr-1">Competition Name: </label>
            <input
              id="competitionName"
              className="form-control"
              placeholder="Competition Name"
              onChange={this.handleCompetitionNameChange}
              value={this.state.competitionName}
              size={40}
            />
          </div>

          <div className="col-md-6 text-left form-group">
            <label className="font-weight-bold pr-1">Password:</label>
            <input
              id="passwordInput"
              className="form-control"
              placeholder="Password"
              type={this.state.showPassword ? "" : "password"}
              onChange={this.handlePasswordChange}
              value={this.state.password}
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

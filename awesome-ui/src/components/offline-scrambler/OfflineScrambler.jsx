import React, { Component } from "react";

import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);

    // State wcif like
    let state = { formatVersion: "1.0", name: "", events: [], password: "" };
    this.state = state;
  }

  generateScrambles = () => {
    // TODO update wcif
    console.log("Getting scrambles");
  };

  handleUpdateEvent = event => {
    let state = this.state;

    // Avoid duplicated events in wcif
    let events = state.events.filter(e => e.id !== event.id);
    events.push(event);
    state.events = events;
    this.setState(state);
    this.handleUpdateWcif(this.state);
  };

  handleCompetitionNameChange = competitionName => {
    let state = this.state;
    state.name = competitionName;
    this.setState(state);
  };

  handlePasswordChange = password => {
    let state = this.state;
    state.password = password;
    this.setState(state);
  };

  render() {
    return (
      <div>
        <EntryInterface
          handleCompetitionNameChange={this.handleCompetitionNameChange}
          handlePasswordChange={this.handlePasswordChange}
        />
        <EventPickerTable handleUpdateEvent={this.handleUpdateEvent} />
        <div className="container form-group p-3">
          <button
            className="btn btn-primary btn-lg"
            onClick={this.generateScrambles}
          >
            Generate Scrambles
          </button>
        </div>
      </div>
    );
  }
}

export default OfflineScrambler;

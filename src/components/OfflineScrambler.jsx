import React, { Component } from "react";

import EntryInterface from "./EntryInterface";
import EventsPicker from "./EventsPicker";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);

    this.generateScrambles = props.generateScrambles;
    this.updateEvent = props.updateEvent;
    this.handleCompetitionNameOrPasswordChange =
      props.handleCompetitionNameOrPasswordChange;
  }

  render() {
    return (
      <div>
        <EntryInterface
          handleCompetitionNameOrPasswordChange={
            this.handleCompetitionNameOrPasswordChange
          }
        />
        <EventsPicker updateEvent={this.updateEvent} />
        <div className="container p-3">
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

import React, { Component } from "react";

import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);

    this.generateScrambles = props.generateScrambles;
  }

  render() {
    return (
      <div>
        <EntryInterface />
        <EventPickerTable />
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

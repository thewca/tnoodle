import React, { Component } from "react";

import EntryInterface from "./EntryInterface";
import EventsPicker from "./EventsPicker";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <EntryInterface />
        <EventsPicker />
      </div>
    );
  }
}

export default OfflineScrambler;

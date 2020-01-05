import React, { Component } from "react";

import EventsTable from "./EventsTable";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        <h1>Offline Scrambler</h1>
        <EventsTable></EventsTable>
      </div>
    );
  }
}

export default OfflineScrambler;

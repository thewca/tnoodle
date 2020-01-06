import React, { Component } from "react";

import EventsTable from "./EventsTable";
import EntryInterface from "./EntryInterface";

class OfflineScrambler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        <EntryInterface></EntryInterface>
        <EventsTable></EventsTable>
      </div>
    );
  }
}

export default OfflineScrambler;

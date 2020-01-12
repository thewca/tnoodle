import React, { Component } from "react";

import EventPicker from "./EventPicker";

import { WCA_EVENTS } from "../constants/wca.constants";
import _ from "lodash";

class EventsPicker extends Component {
  constructor(props) {
    super(props);
    this.updateEvent = props.updateEvent;
  }
  render() {
    let EVENTS_PER_LINE = 3;
    let eventChunks = _.chunk(WCA_EVENTS, EVENTS_PER_LINE);

    return (
      <div className="container p-0">
        {eventChunks.map((events, i) => {
          return (
            <div className="row" key={i}>
              {events.map(event => {
                return (
                  <div
                    className="col-4 p-0 border border-secondary rounded"
                    key={event.id}
                  >
                    <EventPicker event={event} updateEvent={this.updateEvent} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

export default EventsPicker;

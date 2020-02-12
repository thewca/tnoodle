import React, { Component } from "react";

import EventPicker from "./EventPicker";

import { WCA_EVENTS } from "../../constants/wca.constants";
import _ from "lodash";

class EventPickerTable extends Component {
  render() {
    let EVENTS_PER_LINE = 2;
    let eventChunks = _.chunk(WCA_EVENTS, EVENTS_PER_LINE);

    return (
      <div className="container">
        {eventChunks.map((events, i) => {
          return (
            <div className="row" key={i}>
              {events.map(event => {
                return (
                  <div
                    className="col-6 border border-secondary rounded"
                    key={event.id}
                  >
                    <EventPicker event={event} />
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

export default EventPickerTable;

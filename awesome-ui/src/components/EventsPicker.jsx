import React, { Component } from "react";

import EventPicker from "./EventPicker";

import { WCA_EVENTS } from "../constants/wca.constants";
import _ from "lodash";

class EventsPicker extends Component {
  render() {
    let EVENTS_PER_LINE = 3;
    let eventChunks = _.chunk(WCA_EVENTS, EVENTS_PER_LINE);

    return (
      <div className="container">
        {eventChunks.map((events, i) => {
          return (
            <div className="row" key={i}>
              {events.map(event => {
                return (
                  <div className="col-md-4" key={event.id}>
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

export default EventsPicker;

import React, { Component } from "react";
import CubingIcon from "./CubingIcon";
import { wcaEvents } from "../constants/wca.constants";
import { parseActivityCode } from "../functions/wcif.functions";
import { isDigit } from "../functions/validations.functions";

class EventsTable extends Component {
  constructor(props) {
    super(props);

    // Fill scramble sets for each round. Each position in the array means one one round.
    let events = {};
    wcaEvents.forEach(wcaEvent => {
      events[wcaEvent.id] = { roundsForEvents: [0] };
    });
    // As usual, 333 starts with 1 round
    events[333].roundsForEvents[0] = 1;

    let state = { events: events };
    this.state = state;
  }

  handleScrambleSetsChange = evt => {
    let target = evt.target;
    let value = target.value;
    if (!isDigit(value)) {
      return;
    }

    let id = target.id;
    let parsed = parseActivityCode(id);
    let eventId = parsed.eventId;
    let roundNumber = parsed.roundNumber;
    let roundIndex = roundNumber - 1;

    let state = this.state;
    state.events[eventId].roundsForEvents[roundIndex] = Number(value);

    this.setState(state);
  };

  render() {
    let maxRounds = Math.max(
      ...wcaEvents.map(
        event => this.state.events[event.id].roundsForEvents.length
      )
    );

    return (
      <div className="container text-center">
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead className="thead-dark">
            <tr>
              <th className="align-middle" scope="col" />
              <th className="align-middle" scope="col">
                Event
              </th>
              {Array.from({ length: maxRounds }, (_, i) => {
                return (
                  <th className="align-middle" key={i} scope="col">
                    Scramble Sets for Round {i + 1}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {wcaEvents.map(event => (
              <tr key={event.id}>
                <td>
                  <CubingIcon event={event.id} />
                </td>
                <td className="align-middle">{event.id}</td>
                {Array.from({ length: maxRounds }, (_, i) => {
                  // For consistency, we keep the id in the WCIF activity code format 333-r1
                  let round = i + 1;
                  let id = event.id + "-r" + round;
                  return (
                    <td key={id}>
                      <input
                        id={id}
                        value={this.state.events[event.id].roundsForEvents[0]}
                        onChange={this.handleScrambleSetsChange}
                      ></input>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default EventsTable;

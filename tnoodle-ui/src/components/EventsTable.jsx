import React, { Component } from "react";
import CubingIcon from "../CubingIcon";

class EventsTable extends Component {
  render() {
    const { events } = this.props;
    let maxRounds = Math.max.apply(
      Math,
      events.map(event => event.rounds.length)
    );
    return (
      <div className="text-center">
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead className="thead-dark">
            <tr>
              <th scope="col" />
              <th scope="col">Event</th>
              {Array.from(Array(maxRounds), (e, i) => {
                return (
                  <th key={i} scope="col">
                    Groups for Round {i + 1}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr>
                <td>
                  <CubingIcon key={event.id} event={event.id} />
                </td>
                <td className="align-middle">{event.id}</td>
                {event.rounds.map(round => (
                  <td className="align-middle">{round.scrambleSetCount}</td>
                ))}

                {/* Fill empty cells with --- */}
                {Array.from(Array(maxRounds - event.rounds.length), () => {
                  return <td className="align-middle">-- -- --</td>;
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

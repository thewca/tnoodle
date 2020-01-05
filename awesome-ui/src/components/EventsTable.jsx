import React, { Component } from "react";
import CubingIcon from "./CubingIcon";

class EventsTable extends Component {
  render() {
    let events = [
      { id: "333" },
      { id: "222" },
      { id: "444" },
      { id: "555" },
      { id: "666" },
      { id: "777" }
    ];

    return (
      <div className="container text-center">
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead className="thead-dark">
            <tr>
              <th className="align-middle" scope="col" />
              <th className="align-middle" scope="col">
                Event
              </th>
              {Array.from({ length: 1 }, (_, i) => {
                return (
                  <th className="align-middle" key={i} scope="col">
                    Scramble Sets for Round {i + 1}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <CubingIcon event={event.id} />
                </td>
                <td className="align-middle">{event.id}</td>
                input
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default EventsTable;

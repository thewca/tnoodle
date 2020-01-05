import React, { Component } from "react";

class EventsTable extends Component {
  render() {
    let events = [{ id: "333" }, { id: "222" }];

    return (
      <div className="container text-center">
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead className="thead-dark">
            <tr>
              <th className="align-middle" scope="col" />
              <th className="align-middle" scope="col">
                Event
              </th>
              {Array.from({ length: 2 }, (_, i) => {
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
                <td>Icon</td>
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

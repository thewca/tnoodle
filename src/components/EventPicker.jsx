import React, { Component } from "react";

import CubingIcon from "./CubingIcon";

import { MAX_WCA_ROUNDS, FORMATS } from "../constants/wca.constants";

class EventPicker extends Component {
  constructor(props) {
    super(props);
    let state = { value: 0, format: "" };
    this.state = state;
  }

  handleSelectChange = evt => {
    let state = this.state;
    state.value = evt.target.value;
    this.setState(state);
  };

  roundFormatChanged = evt => {};

  abbreviate = str => {
    return FORMATS[str].shortName;
  };

  render() {
    let { event } = this.props;
    console.log(event);
    let options = [
      { text: "# of rounds?", value: 0, disabled: false },
      { text: "────────", disabled: true }
    ];
    Array.from({ length: MAX_WCA_ROUNDS }).forEach((_, i) => {
      options.push({
        text: i + 1 + " round" + (i > 0 ? "s" : ""),
        value: i + 1,
        disabled: false
      });
    });
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3>
            <CubingIcon event={event.id} />
            <span>{event.name}</span>
            <div className="input-group">
              <select onChange={this.handleSelectChange} id={event.id}>
                {options.map(op => (
                  <option value={op.value} disabled={op.disabled} key={op.text}>
                    {op.text}
                  </option>
                ))}
              </select>
            </div>
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Format</th>
              <th>Scramble Sets</th>
              <th>Copies</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: this.state.value }, (_, i) => {
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <select
                      name="format"
                      className="form-control input-xs"
                      onChange={this.roundFormatChanged}
                    >
                      {event.format_ids.map(format => (
                        <option key={format} value={format}>
                          {this.abbreviate(format)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default EventPicker;

import React, { Component } from "react";
import CubingIcon from "./CubingIcon";
import { MAX_WCA_ROUNDS, FORMATS } from "../constants/wca.constants";

class EventPicker extends Component {
  constructor(props) {
    super(props);

    // State wcif like
    let state = { id: props.event.id, rounds: [] };
    this.state = state;
  }

  handleNumberOfRoundsChange = evt => {
    let numberOfRounds = Number(evt.target.value);
    let state = this.state;
    let rounds = state.rounds;

    // Ajust the number of rounds in case we have to remove
    while (rounds.length > numberOfRounds) {
      rounds.pop();
    }

    // case we have to add
    let event = this.state.id;
    while (rounds.length < numberOfRounds) {
      rounds.push({
        id: event + "-r" + (rounds.length + 1),
        format: this.props.event.format_ids[0],
        scrambleSetCount: 1,
        copies: 1
      });
    }
    state.rounds = rounds;
    this.setState(state);
  };

  handleNumberOfScrambleSetsChange = (round, value) => {
    if (value < 1) {
      return;
    }
    let state = this.state;
    state.rounds[round].scrambleSetCount = Number(value);
    this.setState(state);
  };

  roundFormatChanged = (round, value) => {
    let state = this.state;
    state.rounds[round].format = value;
    this.setState(state);
  };

  handleNumberOfCopiesChange = (round, value) => {
    if (value < 1) {
      return;
    }
    let state = this.state;
    state.rounds[round].copies = value;
    this.setState(state);
  };

  abbreviate = str => {
    return FORMATS[str].shortName;
  };

  render() {
    let { event } = this.props;
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
      <div>
        <div>
          <h3>
            <CubingIcon event={event.id} />
            <span>{event.name}</span>
            <div>
              <select onChange={this.handleNumberOfRoundsChange} id={event.id}>
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
            {Array.from({ length: this.state.rounds.length }, (_, i) => {
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <select
                      onChange={evt =>
                        this.roundFormatChanged(i, evt.target.value)
                      }
                    >
                      {event.format_ids.map(format => (
                        <option key={format} value={format}>
                          {this.abbreviate(format)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={this.state.rounds[i].scrambleSetCount}
                      onChange={evt =>
                        this.handleNumberOfScrambleSetsChange(
                          i,
                          Number(evt.target.value)
                        )
                      }
                      min={1}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={this.state.rounds[i].copies}
                      onChange={evt =>
                        this.handleNumberOfCopiesChange(
                          i,
                          Number(evt.target.value)
                        )
                      }
                      min={1}
                    />
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

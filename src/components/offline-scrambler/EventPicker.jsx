import React, { Component } from "react";
import CubingIcon from "../CubingIcon";
import { MAX_WCA_ROUNDS, FORMATS } from "../../constants/wca.constants";
import { connect } from "react-redux";
import { updateWcaEvent } from "../../redux/ActionCreators";

import "./EventPicker.scss";

const mapDispatchToProps = {
  updateWcaEvent: updateWcaEvent
};

const EventPicker = connect(
  null,
  mapDispatchToProps
)(
  class extends Component {
    constructor(props) {
      super(props);

      // State wcif like
      this.state = { id: props.event.id, rounds: [] };
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
      this.updateEvent();
    };

    handleNumberOfScrambleSetsChange = (round, value) => {
      if (value < 1) {
        return;
      }
      let state = this.state;
      state.rounds[round].scrambleSetCount = Number(value);
      this.setState(state);
      this.updateEvent();
    };

    roundFormatChanged = (round, value) => {
      let state = this.state;
      state.rounds[round].format = value;
      this.setState(state);
      this.updateEvent();
    };

    handleNumberOfCopiesChange = (round, value) => {
      if (value < 1) {
        return;
      }
      let state = this.state;
      state.rounds[round].copies = value;
      this.setState(state);
      this.updateEvent();
    };

    abbreviate = str => {
      return FORMATS[str].shortName;
    };

    updateEvent = () => {
      this.props.updateWcaEvent(this.state);
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
        <div className="container">
          <div className="row">
            <span className="col-2">
              <CubingIcon event={event.id} />
            </span>
            <h5 className="col-6 font-weight-bold">{event.name}</h5>
            <div className="col-4">
              <select onChange={this.handleNumberOfRoundsChange} id={event.id}>
                {options.map(op => (
                  <option value={op.value} disabled={op.disabled} key={op.text}>
                    {op.text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="table table-condensed">
            <thead className="thead-light">
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
                  <tr key={i} className="form-group">
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
                        className="form-control"
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
                        className="form-control"
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
);

export default EventPicker;

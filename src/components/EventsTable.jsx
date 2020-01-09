import React, { Component } from "react";
import CubingIcon from "./CubingIcon";
import { WCA_EVENTS, MAX_WCA_ROUNDS } from "../constants/wca.constants";
import { parseActivityCode } from "../functions/wcif.functions";
import { isDigit } from "../functions/validations.functions";

import "./EventsTable.scss";

class EventsTable extends Component {
  constructor(props) {
    super(props);

    this.MAX_SETS_FOR_ROUNDS = 100;
    this.MAX_MBLD_SCRAMBLES = 1000;
    this.MIN_MBLD_SCRAMBLES = 2;

    // Fill scramble sets for each round. Each position in the array means one one round.
    let events = {};
    WCA_EVENTS.forEach(wcaEvent => {
      events[wcaEvent.id] = { roundsForEvents: [0] };
    });
    // As usual, 333 starts with 1 round
    events[333].roundsForEvents[0] = 1;

    let state = { events: events, mbldScrambles: 42 };
    this.state = state;
  }

  componentDidMount() {
    // Since 333 starts with 1 round, we add an empty round.
    this.addEmptyRound();
  }

  addEmptyRound = () => {
    // Do not allow keep adding rounds
    let currentNumberOfRounds = this.getCurrentNumberOfRounds();
    if (currentNumberOfRounds === MAX_WCA_ROUNDS) {
      return;
    }

    let state = this.state;

    WCA_EVENTS.forEach(wcaEvent => {
      state.events[wcaEvent.id].roundsForEvents.push(0);
    });
    this.setState(state);
  };

  removeRoundAtIndex = index => {
    // At least 1 round.
    let currentNumberOfRounds = this.getCurrentNumberOfRounds();
    if (currentNumberOfRounds === 1) {
      return;
    }

    let state = this.state;
    WCA_EVENTS.forEach(event => {
      state.events[event.id].roundsForEvents.splice(index, 1);
    });

    // If we remove a round but the last one is filled, we add an empty round to make the behavior consistent.
    let lastRoundIndex = this.getCurrentNumberOfRounds() - 1;
    if (this.getMaxSetsForRound(lastRoundIndex) > 0) {
      this.addEmptyRound();
    }

    this.setState(state);
  };

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

    let previousMaxRounds = this.getMaxSetsForRound(roundIndex);

    // We do not allow infinity rounds. Things can get strange for ridiculous big numbers.
    state.events[eventId].roundsForEvents[roundIndex] = Math.min(
      Number(value),
      this.MAX_SETS_FOR_ROUNDS
    );

    let currentMaxRounds = this.getMaxSetsForRound(roundIndex);

    if (previousMaxRounds === 0 && currentMaxRounds > 0) {
      this.addEmptyRound();
    } else if (previousMaxRounds > 0 && currentMaxRounds === 0) {
      this.removeRoundAtIndex(roundIndex);
    }

    this.setState(state);
  };

  getMaxSetsForRound = roundIndex => {
    return Math.max(
      ...WCA_EVENTS.map(
        event => this.state.events[event.id].roundsForEvents[roundIndex]
      )
    );
  };

  maybeShowMbldInput = () => {
    let hasMbld = this.state.events["333mbf"].roundsForEvents[0] > 0;

    if (!hasMbld) {
      return;
    }

    return (
      <div className="row">
        <div className="col-md-12 text-right">
          <p>
            This competition has 3x3x3 Multi-Blind. How many scrambles do you
            want for each attempt?
          </p>
          <input
            value={this.state.mbldScrambles}
            onChange={this.handleMbldChange}
          ></input>
        </div>
      </div>
    );
  };

  handleMbldChange = evt => {
    let target = evt.target;
    let value = target.value;
    if (!isDigit(value)) {
      return;
    }
    let state = this.state;
    let mbldScrambles = Math.min(Number(value), this.MAX_MBLD_SCRAMBLES);
    mbldScrambles = Math.max(mbldScrambles, this.MIN_MBLD_SCRAMBLES);
    state.mbldScrambles = mbldScrambles;
    this.setState(state);
  };

  getCurrentNumberOfRounds = () => {
    // We check for every event just in case.
    return Math.max(
      ...WCA_EVENTS.map(
        event => this.state.events[event.id].roundsForEvents.length
      )
    );
  };

  generateScrambles = () => {
    console.log("Mocked scrambles");
  };

  render() {
    let numberOfRounds = this.getCurrentNumberOfRounds();

    return (
      <div className="container text-center">
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead className="thead thead-dark">
            <tr>
              <th className="align-middle" scope="col" />
              <th className="align-middle" scope="col">
                Event
              </th>
              {Array.from({ length: numberOfRounds }, (_, i) => {
                return (
                  <th className="align-middle" key={i} scope="col">
                    Scramble Sets for Round {i + 1}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {WCA_EVENTS.map(event => (
              <tr key={event.id}>
                <td>
                  <CubingIcon event={event.id} />
                </td>
                <td className="align-middle">{event.id}</td>
                {Array.from({ length: numberOfRounds }, (_, i) => {
                  // For consistency, we keep the id in the WCIF activity code format 333-r1
                  let round = i + 1;
                  let id = event.id + "-r" + round;
                  return (
                    <td key={id}>
                      <input
                        id={id}
                        value={this.state.events[event.id].roundsForEvents[i]}
                        onChange={this.handleScrambleSetsChange}
                        size={5}
                        disabled={
                          i > 0 &&
                          this.state.events[event.id].roundsForEvents[i - 1] ===
                            0
                        }
                      ></input>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {this.maybeShowMbldInput()}

        <div className="row" id="scramble-btn-wrapper">
          <div className="col-md-12">
            <button
              className="btn btn-primary btn-lg"
              onClick={this.generateScrambles}
            >
              Generate Scrambles
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default EventsTable;

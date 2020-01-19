import React, { Component } from "react";

import { toWcaUrl } from "../../functions/wca.api";

class SelectCompetition extends Component {
  constructor(props) {
    super(props);
    this.state = { competitions: props.competitions };
  }
  render() {
    if (this.state.competitions == null) {
      return <div>Nothing to show</div>;
    }
    return (
      <div className="competitions-picker">
        <h2 className="text-center">Select an upcoming competition:</h2>
        {this.state.competitions.length === 0 ? (
          <div className="text-center">
            No competitions found, are you sure you have upcoming competitions?
            Try checking{" "}
            <a href={toWcaUrl("/competitions/mine")} target="_blank">
              on the WCA website
            </a>
            .
          </div>
        ) : (
          <div className="list-group">
            {this.state.competitions.map(competition => {
              return (
                <div
                  key={competition.id}
                  to={`/competitions/${competition.id}`}
                  className="list-group-item list-group-item-action"
                >
                  {competition.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default SelectCompetition;

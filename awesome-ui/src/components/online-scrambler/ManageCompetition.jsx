import React, { Component } from "react";
import { getCompetitionJson } from "../../api/wca.api";
import { toWcaUrl } from "../../api/wca.api";
import EventsTable from "./EventsTable";
import { wcaEventId2WcaEventName } from "../../functions/wca.helper";
import { MBLD_MIN, MBLD_DEFAULT } from "../../constants/wca.constants";
import { fetchZip } from "../../api/tnoodle.api";

import FaEye from "react-icons/lib/fa/eye";
import FaEyeSlash from "react-icons/lib/fa/eye-slash";

class ManageCompetition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      competitionId: props.competitionId,
      wcif: null,
      showPassword: false,
      password: "",
      mbld: MBLD_DEFAULT
    };
  }

  multiBlindId = "333mbf";

  componentDidMount() {
    // Fetch competition json
    getCompetitionJson(this.state.competitionId)
      .then(wcif => {
        this.setState({
          ...this.state,
          loading: false,
          wcif: wcif
        });
      })
      .catch(e =>
        this.setState({ ...this.state, loading: false, error: true })
      );
  }

  hasMbld = () =>
    this.state.wcif.events.find(event => event.id === this.multiBlindId);

  toogleShowPassword = () => {
    let state = this.state;
    state.showPassword = !state.showPassword;
    this.setState(state);
  };

  handlePasswordChange = event => {
    event.preventDefault();
    this.setState({
      ...this.state,
      password: event.target.value
    });
  };

  maybeRenderMbldArea() {
    if (!this.hasMbld()) {
      return;
    }
    return (
      <React.Fragment>
        <p>
          This competition has {wcaEventId2WcaEventName(this.multiBlindId)}. How
          many scrambles do you want for each attempt?
        </p>
        <p>
          <input
            className="form-control"
            type="number"
            placeholder="How many puzzles do you expect people to attempt?"
            value={this.state.mbld}
            onChange={evt => this.handleMbldChange(Number(evt.target.value))}
            min={MBLD_MIN}
            onBlur={this.verifyMbld}
          />
        </p>
      </React.Fragment>
    );
  }

  handleMbldChange = mbld => this.setState({ ...this.state, mbld: mbld });

  render() {
    if (this.state.loading) {
      return <p>Loading...</p>;
    }
    if (this.state.error) {
      return <p>Error fetching information.</p>;
    }
    return (
      <div className="container">
        <p>
          Found {this.state.wcif.events.length} event
          {this.state.wcif.events.length > 1 ? "s" : ""} for{" "}
          {this.state.wcif.name}.
        </p>
        <EventsTable events={this.state.wcif.events} />
        <p>
          You can view and change the rounds over on{" "}
          <a
            href={toWcaUrl(
              `/competitions/${this.state.competitionId}/events/edit`
            )}
          >
            the WCA website.
          </a>
          <strong>
            {" "}
            Refresh this page after making any changes on the WCA website.
          </strong>
        </p>

        {this.maybeRenderMbldArea()}

        <div className="row">
          <div className="input-group input-group-lg">
            <div className="col-6">
              <input
                className="form-control"
                placeholder="Password"
                type={this.state.showPassword ? "" : "password"}
                onChange={this.handlePasswordChange}
                value={this.state.password}
              />
              <span
                className="input-group-addon pointer"
                title={
                  this.state.showPassword ? "Hide password" : "Show password"
                }
                onClick={this.toogleShowPassword}
              >
                {this.state.showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <div className="col-6">
              <button
                className="btn btn-primary form-control"
                onClick={_ => fetchZip(this.state.wcif)}
              >
                Generate Scrambles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ManageCompetition;

import React, { Component } from "react";

import "./Index.scss";

import { Link } from "react-router-dom";

import CubingIcon from "./CubingIcon";
import { WCA_EVENTS } from "../constants/wca.constants";
import linkWithQueryParams from "../functions/preserve.search";

class Index extends Component {
  render() {
    let { offlineScramblerLink, onlineScramblerLink } = this.props;
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <h2>Offline Scrambler Program</h2>
              <p>
                Generate scrambles by manually selecting events, number of
                rounds, competition name. You can use this to generate scrambles
                for training or for official competitions.
              </p>
              <p>
                <Link
                  to={linkWithQueryParams(offlineScramblerLink)}
                  className="btn btn-secondary"
                  role="button"
                >
                  Continue Offline »
                </Link>
              </p>
            </div>
            <div className="col-md-2"></div>
            <div className="col-md-5">
              <h2>Online Scrambler Program</h2>
              <p>
                This area is mostly for delegates and organisers. Syncronize
                with your WCA account to fetch data from your next competitions
                to prevent you from manually inputing events, rounds,
                competition name and more.
              </p>
              <p>
                <Link
                  to={linkWithQueryParams(onlineScramblerLink)}
                  className="btn btn-secondary"
                  role="button"
                >
                  Go Online »
                </Link>
              </p>
            </div>
          </div>

          <div className="row" id="events-to-show">
            <div className="col-md-12">
              {WCA_EVENTS.map(event => (
                <span key={event.id}>
                  <CubingIcon event={event.id} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;

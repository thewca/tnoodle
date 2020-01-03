import React, { Component } from "react";

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <h2>Offline Scrambler Program</h2>
              <p>
                Generate scrambles by selecting events, number of rounds,
                competition name. You can use this to generate scrambles for
                training or for official competitions.
              </p>
              <p>
                <a className="btn btn-secondary" role="button">
                  Go Offline
                </a>
              </p>
            </div>
            <div className="col-md-2"></div>
            <div className="col-md-5">
              <h2>Online Scrambler Program</h2>
              <p>
                This area is mostly for delegates and organisers. Syncronize
                with your WCA account to fetch data from your next competitions
                to keep you from manually input events, rounds, competition name
                and more.
              </p>
              <p>
                <a className="btn btn-secondary" role="button">
                  Go Online
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;

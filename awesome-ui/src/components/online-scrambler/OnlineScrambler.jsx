import React, { Component } from "react";
import SelectCompetition from "./SelectCompetition";
import { connect } from "react-redux";
import { fetchMe, isLogged } from "../../api/wca.api";
import { updateMe } from "../../redux/ActionCreators";

const mapStateToProps = store => ({
  me: store.me
});

const mapDispatchToProps = {
  updateMe: updateMe
};

const OnlineScrambler = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends Component {
    constructor(props) {
      super(props);
      this.state = { competitions: [], me: this.props.me, unauthorized: false };
    }

    componentDidMount() {
      if (!isLogged()) {
        return;
      }
      if (this.state.me == null) {
        fetchMe()
          .then(me => this.handleUpdateMe(me))
          .catch(e => {
            this.setState({ ...this.state, unauthorized: true });
          });
      }
    }

    handleUpdateMe = me => {
      this.setState({ ...this.state, me: me });
      this.props.updateMe(me);
    };

    render() {
      if (this.state.unauthorized) {
        return (
          <div>
            <h4>There was a problem while fetching information.</h4>
            <p>Try to log in again.</p>
          </div>
        );
      }

      if (this.state.me == null) {
        return (
          <div>
            <h1>You have to login first</h1>
          </div>
        );
      }
      return (
        <div className="container">
          <h1>Welcome, {this.state.me.name}</h1>
          <SelectCompetition competitions={this.props.competitions} />
        </div>
      );
    }
  }
);

export default OnlineScrambler;

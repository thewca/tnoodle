import React, { Component } from "react";
import { updateWcif } from "../../redux/ActionCreators";
import { connect } from "react-redux";

const mapDispatchToProps = {
  updateWcif: updateWcif
};

const ManageCompetition = connect(
  null,
  mapDispatchToProps
)(
  class extends Component {
    render() {
      return (
        <div className="competitions-picker">
          <p>{this.props.competitionId}</p>
        </div>
      );
    }
  }
);

export default ManageCompetition;

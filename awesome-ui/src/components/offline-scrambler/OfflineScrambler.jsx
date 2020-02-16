import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { fetchZip } from "../../api/tnoodle.api";
import { connect } from "react-redux";

const mapStateToProps = store => ({
  wcif: store.wcif
});

const OfflineScrambler = connect(mapStateToProps)(
  class extends Component {
    render() {
      return (
        <div>
          <EntryInterface />
          <EventPickerTable />
          <div className="container form-group p-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={_ => fetchZip(this.props.wcif)}
            >
              Generate Scrambles
            </button>
          </div>
        </div>
      );
    }
  }
);

export default OfflineScrambler;

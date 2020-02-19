import React, { Component } from "react";
import EventPicker from "./EventPicker";
import { connect } from "react-redux";
import { WCA_EVENTS } from "../constants/wca.constants";
import { fetchZip } from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";

const mapStateToProps = store => ({
    wcif: store.wcif
});

const EventPickerTable = connect(mapStateToProps)(
    class extends Component {
        constructor(props) {
            super(props);

            let events = props.events || props.wcif.events || [];

            // Prevent offline from remembering online order
            let wcaEvents = [...WCA_EVENTS];

            // If the events > 0, this means that this was a fetched wcif so we disabled the manual selection
            let editingDisabled = events.length > 0;

            // At start, this will sort the filled events first for visual. Helpful for fetching info.
            if (editingDisabled) {
                wcaEvents.forEach(wcaEvent => {
                    let isEmpty = !events.find(item => item.id === wcaEvent.id);
                    wcaEvent.isEmpty = isEmpty;
                });
                wcaEvents.sort((a, b) => {
                    if (a.isEmpty === b.isEmpty) {
                        return 1;
                    }
                    if (b.isEmpty) {
                        return -1;
                    }
                    return 1;
                });
            }

            this.state = {
                events: events,
                editingDisabled: editingDisabled,
                wcaEvents: wcaEvents,
                competitionId: props.competitionId
            };
        }

        handleScrambleButton = () => {
            fetchZip(this.props.wcif);
        };

        maybeShowEditWarning = () => {
            if (this.state.competitionId == null) {
                return;
            }
            return (
                <div className="row">
                    <p>
                        Found {this.state.events.length} event
                        {this.state.events.length > 1 ? "s" : ""} for{" "}
                        {this.props.wcif.name}.
                    </p>
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
                            Refresh this page after making any changes on the
                            WCA website.
                        </strong>
                    </p>
                </div>
            );
        };

        render() {
            // At least 1 events must have at least 1 round.
            let disableScrambleButton = !this.props.wcif.events
                .map(event => event.rounds.length > 0)
                .reduce((flag1, flag2) => flag1 || flag2, false);

            return (
                <div className="container">
                    {this.maybeShowEditWarning()}
                    {this.state.wcaEvents.map(event => {
                        return (
                            <div className="row" key={event.id}>
                                <EventPicker
                                    event={event}
                                    wcifEvent={this.state.events.find(
                                        item => item.id === event.id
                                    )}
                                    disabled={this.state.editingDisabled}
                                />
                            </div>
                        );
                    })}
                    <div className="row form-group p-3">
                        <div className="col-12">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={this.handleScrambleButton}
                                disabled={disableScrambleButton}
                                title={
                                    disableScrambleButton
                                        ? "No events selected."
                                        : ""
                                }
                            >
                                Generate Scrambles
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }
);

export default EventPickerTable;

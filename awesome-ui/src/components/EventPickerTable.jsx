import React, { Component } from "react";
import EventPicker from "./EventPicker";
import { connect } from "react-redux";
import { WCA_EVENTS } from "../constants/wca.constants";
import { fetchZip } from "../api/tnoodle.api";

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
            let disabled = events.length > 0;

            // At start, this will sort the filled events first for visual. Helpful for fetching info.
            if (disabled) {
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
                disabled: disabled,
                wcaEvents: wcaEvents
            };
        }

        handleScrambleButton = () => {
            fetchZip(this.props.wcif);
        };

        render() {
            // At least 1 events must have at least 1 round.
            let disableScrambleButton = !this.props.wcif.events
                .map(event => event.rounds.length > 0)
                .reduce((flag1, flag2) => flag1 || flag2, false);

            return (
                <div className="container">
                    {this.state.wcaEvents.map(event => {
                        return (
                            <div className="row" key={event.id}>
                                <EventPicker
                                    event={event}
                                    wcifEvent={this.state.events.find(
                                        item => item.id === event.id
                                    )}
                                    disabled={this.state.disabled}
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

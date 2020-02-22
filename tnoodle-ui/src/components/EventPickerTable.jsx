import React, { Component } from "react";
import EventPicker from "./EventPicker";
import { connect } from "react-redux";
import { WCA_EVENTS } from "../constants/wca.constants";
import { fetchZip } from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";

const mapStateToProps = store => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password
});

const EventPickerTable = connect(mapStateToProps)(
    class extends Component {
        constructor(props) {
            super(props);

            // If the events > 0, this means that this was a fetched wcif so we disabled the manual selection
            let events = props.wcif.events;
            let editingDisabled = events.length > 0;

            // Prevent offline from remembering online order
            let wcaEvents = [...WCA_EVENTS];

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
                editingDisabled: editingDisabled,
                wcaEvents: wcaEvents,
                competitionId: props.competitionId,
                generatingScrambles: false,
                fileZipBlob: null,
                wcif: props.wcif
            };
        }

        handleScrambleButton = () => {
            this.setGeneratingScrambles(true);
            fetchZip(this.props.wcif, this.props.mbld, this.props.password)
                .then(response => response.blob())
                .then(blob => {
                    this.setGeneratingScrambles(false);
                    this.setState({ ...this.state, fileZipBlob: blob });
                })
                .catch(e => console.log(e));
        };

        setGeneratingScrambles = flag => {
            this.setState({ ...this.state, generatingScrambles: flag });
        };

        downloadZip = () => {
            // TODO add [Unofficial] before the zip name if staging or !official tnoodle version

            console.log(this.state);

            let fileName = this.state.wcif.name + ".zip";

            const link = document.createElement("a");
            link.href = URL.createObjectURL(this.state.fileZipBlob);
            link.download = fileName;
            link.target = "_blank";
            link.setAttribute("type", "hidden");

            // This is needed for firefox
            document.body.appendChild(link);

            link.click();
            link.remove();
        };

        maybeShowEditWarning = () => {
            if (this.state.competitionId == null) {
                return;
            }
            return (
                <div className="row">
                    <p>
                        Found {this.state.wcif.events.length} event
                        {this.state.wcif.events.length > 1 ? "s" : ""} for{" "}
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
                            Refresh this page after making any changes on the
                            WCA website.
                        </strong>
                    </p>
                </div>
            );
        };

        scrambleButton = () => {
            if (this.state.generatingScrambles) {
                return (
                    <button
                        className="btn btn-primary btn-lg"
                        title="Wait until the process is done"
                        disabled
                    >
                        Generating Scrambles
                    </button>
                );
            }
            if (this.state.fileZipBlob != null) {
                return (
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={this.downloadZip}
                    >
                        Download Scrambles
                    </button>
                );
            }

            // At least 1 events must have at least 1 round.
            let disableScrambleButton = !this.props.wcif.events
                .map(event => event.rounds.length > 0)
                .reduce((flag1, flag2) => flag1 || flag2, false);
            return (
                <button
                    className="btn btn-primary btn-lg"
                    onClick={this.handleScrambleButton}
                    disabled={disableScrambleButton}
                    title={disableScrambleButton ? "No events selected." : ""}
                >
                    Generate Scrambles
                </button>
            );
        };

        /**
         * When user change some event, we reset blob.
         * If the user generate a scramble and then change some event,
         * this allow generating other set of scrambles.
         */
        setBlobNull = () => {
            this.setState({ ...this.state, fileZipBlob: null });
        };

        render() {
            return (
                <div className="container">
                    {this.maybeShowEditWarning()}
                    {this.state.wcaEvents.map(event => {
                        return (
                            <div className="row" key={event.id}>
                                <EventPicker
                                    event={event}
                                    wcifEvent={this.state.wcif.events.find(
                                        item => item.id === event.id
                                    )}
                                    disabled={this.state.editingDisabled}
                                    setBlobNull={this.setBlobNull}
                                />
                            </div>
                        );
                    })}
                    <div className="row form-group p-3">
                        <div className="col-12">{this.scrambleButton()}</div>
                    </div>
                </div>
            );
        }
    }
);

export default EventPickerTable;

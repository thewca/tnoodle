import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { WCA_EVENTS } from "../constants/wca.constants";
import { fetchZip } from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";
import EventPicker from "./EventPicker";
import VersionInfo from "./VersionInfo";

const mapStateToProps = store => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password,
    editingStatus: store.editingStatus
});

const BOOTSTRAP_GRID = 12;
const EVENTS_PER_LINE = 2;

const EventPickerTable = connect(mapStateToProps)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = { fileZipBlob: null, generatingScrambles: false };
        }
        handleScrambleButton = () => {
            this.setGeneratingScrambles(true);
            fetchZip(this.props.wcif, this.props.mbld, this.props.password)
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    }
                    this.setGeneratingScrambles(false);
                    throw new Error("Could not generate scrambles.");
                })
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

            let fileName = this.props.wcif.name + ".zip";

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
            if (this.props.competitionId == null) {
                return;
            }
            return (
                <div className="row">
                    <p>
                        Found {this.props.wcif.events.length} event
                        {this.props.wcif.events.length > 1 ? "s" : ""} for{" "}
                        {this.props.wcif.name}.
                    </p>
                    <p>
                        You can view and change the rounds over on{" "}
                        <a
                            href={toWcaUrl(
                                `/competitions/${this.props.competitionId}/events/edit`
                            )}
                        >
                            the WCA props.
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
            console.log(this.props);
            let events = this.props.wcif.events;
            let editingDisabled = !this.props.editingStatus;

            // Prevent from remembering previous order
            let wcaEvents = [...WCA_EVENTS];

            // This filters events to show only those in the competition.
            if (editingDisabled) {
                wcaEvents = wcaEvents.filter(wcaEvent =>
                    events.find(item => item.id === wcaEvent.id)
                );
            }

            let eventChunks = _.chunk(wcaEvents, EVENTS_PER_LINE);

            let classColPerEvent = `pl-1 pr-1 col-${BOOTSTRAP_GRID /
                EVENTS_PER_LINE}`;
            return (
                <div className="container-fluid">
                    <VersionInfo />
                    {this.maybeShowEditWarning()}
                    {eventChunks.map((chunk, i) => {
                        return (
                            <div className="row p-0" key={i}>
                                {chunk.map(event => {
                                    return (
                                        <div
                                            className={classColPerEvent}
                                            key={event.id}
                                        >
                                            <EventPicker
                                                event={event}
                                                wcifEvent={this.props.wcif.events.find(
                                                    item => item.id === event.id
                                                )}
                                                disabled={editingDisabled}
                                                setBlobNull={this.setBlobNull}
                                            />
                                        </div>
                                    );
                                })}
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

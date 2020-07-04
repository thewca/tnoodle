import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {
    fetchZip,
    fetchAvailableFmcTranslations,
    fetchFormats,
    fetchWcaEvents,
} from "../api/tnoodle.api";
import { toWcaUrl, isUsingStaging } from "../api/wca.api";
import {
    updateFileZipBlob,
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
    updateFlashMessage,
} from "../redux/ActionCreators";
import EventPicker from "./EventPicker";

let DANGER = "danger";

const mapStateToProps = (store) => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password,
    editingDisabled: store.editingDisabled,
    competitionId: store.competitionId,
    officialZip: store.officialZip,
    fileZipBlob: store.fileZipBlob,
    translations: store.translations,
    wcaEvents: store.wcaEvents,
});

const mapDispatchToProps = {
    updateFileZipBlob,
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
    updateFlashMessage,
};

const BOOTSTRAP_GRID = 12;
const EVENTS_PER_LINE = 2;

const EventPickerTable = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                generatingScrambles: false,
                competitionNameFileZip: "",
            };
        }

        componentDidMount = function () {
            this.getFormats();
            this.getWcaEvents();
            this.getFmcTranslations();
        };

        setFlashMessage = (text, bg, response) => {
            this.props.updateFlashMessage(text + " " + response.statusText, bg);
        };

        getFormats = () => {
            fetchFormats()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }

                    // Error
                    this.setFlashMessage(
                        "Could not get WCA formats",
                        DANGER,
                        response
                    );
                })
                .then((formats) => {
                    this.props.setWcaFormats(formats);
                });
        };

        getWcaEvents = () => {
            fetchWcaEvents()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }

                    // Error
                    this.setFlashMessage(
                        "Could get WCA events",
                        DANGER,
                        response
                    );
                })
                .then((wcaEvents) => {
                    this.props.setWcaEvents(wcaEvents);
                });
        };

        getFmcTranslations = () => {
            fetchAvailableFmcTranslations()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }

                    // Error
                    this.setFlashMessage(
                        "Could not get FMC translations.",
                        DANGER,
                        response
                    );
                })
                .then((availableTranslations) => {
                    if (!availableTranslations) {
                        return;
                    }
                    let translations = Object.keys(availableTranslations).map(
                        (translationId) => ({
                            id: translationId,
                            display: availableTranslations[translationId],
                            status: true,
                        })
                    );
                    this.props.updateTranslations(translations);
                });
        };

        handleScrambleButton = () => {
            // If user navigates during generation proccess, we still get the correct name
            this.setState({
                ...this.state,
                competitionNameFileZip: this.props.wcif.name,
                generatingScrambles: true,
            });
            fetchZip(
                this.props.wcif,
                this.props.mbld,
                this.props.password,
                this.props.translations
            )
                .then((response) => {
                    this.setGeneratingScrambles(false);
                    if (response.ok) {
                        return response.blob();
                    }
                    this.setFlashMessage(
                        "Could not get scrambles.",
                        DANGER,
                        response
                    );
                })
                .then((blob) => this.props.updateFileZipBlob(blob));
        };

        setGeneratingScrambles = (flag) => {
            this.setState({ ...this.state, generatingScrambles: flag });
        };

        downloadZip = () => {
            // We use the unofficialZip to stamp .zip in order to prevent delegates / organizers mistakes.
            // If TNoodle version is not official (as per VersionInfo) or if we generate scrambles using
            // a competition from staging, add a [Unofficial]

            let isUnofficialZip =
                !this.props.officialZip ||
                (this.props.competitionId != null && isUsingStaging());

            let fileName =
                (isUnofficialZip ? "[UNOFFICIAL] " : "") +
                this.state.competitionNameFileZip +
                ".zip";

            const link = document.createElement("a");
            link.href = URL.createObjectURL(this.props.fileZipBlob);
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
                            the WCA.
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
            if (this.props.fileZipBlob != null) {
                return (
                    <button
                        className="btn btn-success btn-lg"
                        onClick={this.downloadZip}
                    >
                        Download Scrambles
                    </button>
                );
            }

            // At least 1 events must have at least 1 round.
            let disableScrambleButton = !this.props.wcif.events
                .map((event) => event.rounds.length > 0)
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

        render() {
            // Prevent from remembering previous order
            let wcaEvents = this.props.wcaEvents;
            if (wcaEvents == null) {
                return null;
            }

            let events = this.props.wcif.events;
            let editingDisabled = this.props.editingDisabled;

            // This filters events to show only those in the competition.
            if (editingDisabled) {
                wcaEvents = wcaEvents.filter((wcaEvent) =>
                    events.find((item) => item.id === wcaEvent.id)
                );
            }

            let eventChunks = _.chunk(wcaEvents, EVENTS_PER_LINE);

            let classColPerEvent = `p-1 col-${
                BOOTSTRAP_GRID / EVENTS_PER_LINE
            }`;
            return (
                <div className="row">
                    <div className="container-fluid">
                        {this.maybeShowEditWarning()}
                        {eventChunks.map((chunk, i) => {
                            return (
                                <div className="row p-0" key={i}>
                                    {chunk.map((event) => {
                                        return (
                                            <div
                                                className={classColPerEvent}
                                                key={event.id}
                                            >
                                                <EventPicker
                                                    event={event}
                                                    wcifEvent={this.props.wcif.events.find(
                                                        (item) =>
                                                            item.id === event.id
                                                    )}
                                                    disabled={editingDisabled}
                                                    setBlobNull={
                                                        this.setBlobNull
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                        <div className="row form-group p-3">
                            <div className="col-12">
                                {this.scrambleButton()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
);

export default EventPickerTable;

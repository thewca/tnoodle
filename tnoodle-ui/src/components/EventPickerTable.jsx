import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {
    fetchAvailableFmcTranslations,
    fetchFormats,
    fetchWcaEvents,
} from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";
import {
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
} from "../redux/ActionCreators";
import EventPicker from "./EventPicker";

const mapStateToProps = (store) => ({
    wcif: store.wcif,
    editingDisabled: store.editingDisabled,
    competitionId: store.competitionId,
    translations: store.translations,
    wcaEvents: store.wcaEvents,
});

const mapDispatchToProps = {
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
};

const BOOTSTRAP_GRID = 12;
const EVENTS_PER_LINE = 2;

const EventPickerTable = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        componentDidMount() {
            this.getFormats();
            this.getWcaEvents();
            this.getFmcTranslations();
        }

        getFormats = () => {
            fetchFormats()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
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

        maybeShowEditWarning = () => {
            if (this.props.competitionId == null) {
                return;
            }
            return (
                <div className="row">
                    <div className="col-12">
                        <p>
                            Found {this.props.wcif.events.length} event
                            {this.props.wcif.events.length > 1
                                ? "s"
                                : ""} for {this.props.wcif.name}.
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
                                Refresh this page after making any changes on
                                the WCA website.
                            </strong>
                        </p>
                    </div>
                </div>
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

            let classColPerEvent = ` col-md-${
                BOOTSTRAP_GRID / EVENTS_PER_LINE
            }`;
            return (
                <div className="container-fluid mt-2">
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
                                                setBlobNull={this.setBlobNull}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        }
    }
);

export default EventPickerTable;

import React, { useEffect } from "react";
import _ from "lodash";
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
import { useDispatch, useSelector } from "react-redux";

const EVENTS_PER_LINE = 2;

const EventPickerTable = () => {
    const competitionId = useSelector((state) => state.competitionId);
    const wcif = useSelector((state) => state.wcif);
    const wcaEvents = useSelector((state) => state.wcaEvents);
    const editingDisabled = useSelector((state) => state.editingDisabled);

    const dispatch = useDispatch();

    const getFmcTranslations = () => {
        fetchAvailableFmcTranslations().then((availableTranslations) => {
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
            dispatch(updateTranslations(translations));
        });
    };

    const fetchInformation = () => {
        fetchFormats().then((response) => dispatch(setWcaFormats(response)));
        fetchWcaEvents().then((response) => dispatch(setWcaEvents(response)));
        getFmcTranslations();
    };

    useEffect(fetchInformation, []);

    const maybeShowEditWarning = () => {
        if (!competitionId) {
            return;
        }
        return (
            <div className="row">
                <div className="col-12">
                    <p>
                        Found {wcif.events.length} event
                        {wcif.events.length > 1 ? "s" : ""} for {wcif.name}.
                    </p>
                    <p>
                        You can view and change the rounds over on
                        <a
                            href={toWcaUrl(
                                `/competitions/${competitionId}/events/edit`
                            )}
                        >
                            the WCA.
                        </a>
                        <strong>
                            Refresh this page after making any changes on the
                            WCA website.
                        </strong>
                    </p>
                </div>
            </div>
        );
    };

    // Prevent from remembering previous order
    if (!wcaEvents) {
        return null;
    }

    // This filters events to show only those in the competition.
    let filteredEvents = wcaEvents.filter(
        (wcaEvent) =>
            !editingDisabled ||
            wcif.events.find((item) => item.id === wcaEvent.id)
    );

    let eventChunks = _.chunk(filteredEvents, EVENTS_PER_LINE);

    return (
        <div className="container-fluid mt-2">
            {maybeShowEditWarning()}
            {eventChunks.map((chunk, i) => {
                return (
                    <div className="row p-0" key={i}>
                        {chunk.map((event) => {
                            return (
                                <div className="col-lg-6" key={event.id}>
                                    <EventPicker
                                        event={event}
                                        wcifEvent={wcif.events.find(
                                            (item) => item.id === event.id
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default EventPickerTable;

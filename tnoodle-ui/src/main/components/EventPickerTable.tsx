import { chunk } from "lodash";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAvailableFmcTranslations,
    fetchFormats,
    fetchWcaEvents,
} from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";
import RootState from "../model/RootState";
import WcaEvent from "../model/WcaEvent";
import {
    setWcaEvents,
    setWcaFormats,
    updateTranslations,
} from "../redux/ActionCreators";
import EventPicker from "./EventPicker";

const EVENTS_PER_LINE = 2;

const EventPickerTable = () => {
    const competitionId = useSelector(
        (state: RootState) => state.competitionId
    );
    const wcif = useSelector((state: RootState) => state.wcif);
    const wcaEvents = useSelector((state: RootState) => state.wcaEvents);
    const editingDisabled = useSelector(
        (state: RootState) => state.editingDisabled
    );

    const dispatch = useDispatch();

    const getFmcTranslations = useCallback(() => {
        fetchAvailableFmcTranslations().then((availableTranslations) => {
            if (!availableTranslations) {
                return;
            }
            let translations = Object.keys(availableTranslations).map(
                (translationId) => ({
                    id: translationId,
                    name: availableTranslations[translationId],
                    status: true,
                })
            );
            dispatch(updateTranslations(translations));
        });
    }, [dispatch]);

    const fetchInformation = () => {
        fetchFormats().then((response) => {
            dispatch(setWcaFormats(response));
        });
        fetchWcaEvents().then((response: WcaEvent[]) =>
            dispatch(setWcaEvents(response))
        );
        getFmcTranslations();
    };

    useEffect(fetchInformation, [dispatch, getFmcTranslations]);

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
                        You can view and change the rounds over on{" "}
                        <a
                            href={toWcaUrl(
                                `/competitions/${competitionId}/events/edit`
                            )}
                        >
                            {" "}
                            the WCA
                        </a>
                        .{" "}
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

    let eventChunks = chunk(filteredEvents, EVENTS_PER_LINE);

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

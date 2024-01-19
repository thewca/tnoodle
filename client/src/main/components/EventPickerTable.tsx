import { chunk } from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import { toWcaUrl } from "../api/wca.api";
import RootState from "../model/RootState";
import { setWcaEvents, setWcaFormats } from "../redux/slice/WcifSlice";
import EventPicker from "./EventPicker";
import WcaEvent from "../model/WcaEvent";
import { buildMbldExtension } from "../util/wcif.util";
import { MBLD_DEFAULT } from "../constants/wca.constants";

const EVENTS_PER_LINE = 2;

const EventPickerTable = () => {
    const isManualSelection = useSelector(
        (state: RootState) => state.informationSlice.isManualSelection
    );
    const wcif = useSelector(
        (state: RootState) => state.wcifSlice.wcif
    );
    const wcaEvents = useSelector(
        (state: RootState) => state.wcifSlice.wcaEvents
    );

    const dispatch = useDispatch();

    useEffect(() => {
        tnoodleApi.fetchFormats().then((response) => {
            dispatch(setWcaFormats(response.data));
        });
        tnoodleApi.fetchWcaEvents().then((response) => {
            dispatch(setWcaEvents(response.data));
        });
    }, [dispatch]);

    const generateDefaultEvent = (wcaEvent: WcaEvent) => {
        const extensions = wcaEvent.is_multiple_blindfolded ? [buildMbldExtension(MBLD_DEFAULT)] : [];

        return {
            id: wcaEvent.id,
            rounds: [],
            extensions,
        };
    }

    const maybeShowEditWarning = () => {
        if (isManualSelection) {
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
                                `/competitions/${wcif.id}/events/edit`
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
            isManualSelection ||
            wcif.events.find((item) => item.id === wcaEvent.id)
    );

    let eventChunks = chunk(filteredEvents, EVENTS_PER_LINE);

    return (
        <div className="container-fluid mt-2">
            {maybeShowEditWarning()}
            {eventChunks.map((chunk, i) => {
                return (
                    <div className="row p-0" key={i}>
                        {chunk.map((wcaEvent) => {
                            let wcifEvent = wcif.events.find(
                                (item) => item.id === wcaEvent.id
                            ) || generateDefaultEvent(wcaEvent);

                            return (
                                <div className="col-lg-6" key={wcaEvent.id}>
                                    <EventPicker
                                        wcaEvent={wcaEvent}
                                        wcifEvent={wcifEvent}
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

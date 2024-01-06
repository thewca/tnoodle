import { render, act, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import EventPicker from "../main/components/EventPicker";
import {
    setGeneratingScrambles,
    setScramblingProgressCurrentEvent,
    setScramblingProgressTarget,
} from "../main/redux/slice/ScramblingSlice";
import { setIsManualSelection } from "../main/redux/slice/InformationSlice";
import store from "../main/redux/Store";
import { defaultWcif } from "../main/util/wcif.util";
import {
    colorScheme,
    emptySvg,
    events,
    scrambleAndImage,
} from "./mock/tnoodle.api.test.mock";
import tnoodleApi from "../main/api/tnoodle.api";
import { axiosResponse } from "./mock/util.test.mock";

let container = document.createElement("div");
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    jest.spyOn(tnoodleApi, "fetchPuzzleColorScheme").mockImplementation(() =>
        Promise.resolve({ data: colorScheme, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchPuzzleRandomScramble").mockImplementation(() =>
        Promise.resolve({ data: scrambleAndImage, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchPuzzleSolvedSvg").mockImplementation(() =>
        Promise.resolve({ data: emptySvg, ...axiosResponse })
    );
});

afterEach(() => {
    // cleanup on exiting
    container.remove();
    container = document.createElement("div");

    jest.spyOn(tnoodleApi, "fetchPuzzleColorScheme").mockRestore();
    jest.spyOn(tnoodleApi, "fetchPuzzleRandomScramble").mockRestore();
    jest.spyOn(tnoodleApi, "fetchPuzzleSolvedSvg").mockRestore();
});

it("Changing values from event", async () => {
    const event = events[0];
    const wcifEvent = defaultWcif.events[0]; // This is one round of 333

    // Enforce that fields are not disabled
    store.dispatch(setIsManualSelection(true));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPicker wcaEvent={event} wcifEvent={wcifEvent} />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    // Change number of rounds to 4
    let numberOfRounds = 4;
    const roundsSelector = container.querySelector("select")!;
    await act(async () => {
        fireEvent.change(roundsSelector, { target: { value: numberOfRounds } });
    });

    expect(store.getState().wcifSlice.wcif.events[0].rounds.length).toEqual(
        numberOfRounds
    );

    expect(
        store.getState().wcifSlice.wcif.events[0].rounds[0].scrambleSetCount
    ).toBe(1);

    // This should be numberOfRounds * 2, since each round has 2 inputs.
    // It's not, probably because not updating DOM after dispatching
    const inputs = Array.from(container.querySelectorAll("input"));

    let roundToChange = 0;
    let value = 10;

    // Change last scramble sets to 10
    fireEvent.change(inputs[roundToChange * 2], { target: { value } });
    expect(
        store.getState().wcifSlice.wcif.events[0].rounds[roundToChange]
            .scrambleSetCount
    ).toEqual(value);

    // Remove 1 round
    numberOfRounds--;
    fireEvent.change(roundsSelector, { target: { value: numberOfRounds } });
    expect(store.getState().wcifSlice.wcif.events[0].rounds.length).toEqual(
        numberOfRounds
    );

    const scrambleSets = inputs[0];
    const copies = inputs[1];

    // Jsdom allow editing even disabled inputs so this test makes sense
    expect(scrambleSets.disabled).toBe(false);
    expect(copies.disabled).toBe(false);

    // Changes to scrambleSet should go to the store
    const newScrambleSets = 3;
    fireEvent.change(scrambleSets, { target: { value: newScrambleSets } });
    expect(
        store.getState().wcifSlice.wcif.events[0].rounds[0].scrambleSetCount
    ).toBe(newScrambleSets);

    // Initial value should be 1
    expect(
        store.getState().wcifSlice.wcif.events[0].rounds[0].extensions[0].data
            .numCopies
    ).toBe(1);

    // Changes to copies should go to the store
    const newCopies = 5;
    fireEvent.change(copies, { target: { value: newCopies } });
    expect(
        store.getState().wcifSlice.wcif.events[0].rounds[0].extensions[0].data
            .numCopies
    ).toBe(newCopies);
});

it("Editing disabled", async () => {
    const event = events[0];
    const wcifEvent = defaultWcif.events[0]; // This is one round of 333

    // Disable inputs
    store.dispatch(setIsManualSelection(false));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPicker wcaEvent={event} wcifEvent={wcifEvent} />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    const inputs = Array.from(container.querySelectorAll("input"));
    const scrambleSets = inputs[0];
    const copies = inputs[1];

    // Jsdom allow editing even disabled inputs so this test makes sense
    expect(scrambleSets.disabled).toBe(true);

    // Copies must be editable anyways
    expect(copies.disabled).toBe(false);
});

it("Progress Bar showing/hiding", async () => {
    const event = events[0];
    const wcifEvent = defaultWcif.events[0]; // This is one round of 333

    // Disable inputs
    store.dispatch(setIsManualSelection(false));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPicker wcaEvent={event} wcifEvent={wcifEvent} />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    const progressBefore = Array.from(
        container.querySelectorAll("div.progress")
    );

    expect(progressBefore.length).toBe(0);

    await act(async () => {
        store.dispatch(setScramblingProgressTarget({ [event.id]: 3 }));
        store.dispatch(setGeneratingScrambles(true));
    });

    const progressDuringEarly = Array.from(
        container.querySelectorAll("div.progress>div")
    );

    expect(progressDuringEarly.length).toBe(1);

    await act(async () => {
        store.dispatch(setScramblingProgressCurrentEvent(event.id));
        store.dispatch(setScramblingProgressCurrentEvent(event.id));
    });

    const progressDuringLate = Array.from(
        container.querySelectorAll("div.progress>div")
    );

    expect(progressDuringLate.length).toBe(1);
    const lateProgress = parseFloat(
        progressDuringLate[0].getAttribute("aria-valuenow")!
    );
    expect(Math.trunc(lateProgress)).toBe(66);

    await act(async () => {
        store.dispatch(setScramblingProgressCurrentEvent(event.id));
    });

    const progressAfter = Array.from(
        container.querySelectorAll("div.progress>div")
    );

    expect(progressAfter.length).toBe(1);
    const completeProgress = parseInt(
        progressAfter[0].getAttribute("aria-valuenow")!
    );
    expect(completeProgress).toBe(100);

    await act(async () => {
        store.dispatch(setGeneratingScrambles(false));
    });

    const progressGone = Array.from(container.querySelectorAll("div.progress"));

    expect(progressGone.length).toBe(0);
});

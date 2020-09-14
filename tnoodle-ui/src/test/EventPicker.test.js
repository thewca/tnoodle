import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { Reducer } from "../main/redux/Reducers";

import EventPicker from "../main/components/EventPicker";

import { events } from "./mock/tnoodle.api.mock";

import { defaultWcif } from "../main/constants/default.wcif";

import { updateEditingStatus } from "../main/redux/ActionCreators";

let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
});

it("Changing values from event", () => {
    const store = createStore(Reducer);

    const event = events[0];
    const wcifEvent = defaultWcif.events[0]; // This is one round of 333

    // Enforce that fields are not disabled
    store.dispatch(updateEditingStatus(false));

    // Render component
    act(() => {
        render(
            <Provider store={store}>
                <EventPicker event={event} wcifEvent={wcifEvent} />
            </Provider>,
            container
        );
    });

    // Change number of rounds to 4
    let numberOfRounds = 4;
    const roundsSelector = container.querySelector("select");
    fireEvent.change(roundsSelector, { target: { value: numberOfRounds } });
    expect(store.getState().wcif.events[0].rounds.length).toEqual(
        numberOfRounds
    );

    const inputs = Array.from(container.querySelectorAll("input"));

    // Change last scramble sets to 10
    fireEvent.change(inputs[inputs.length - 2], { target: { value: 10 } });
    expect(
        store.getState().wcif.events[0].rounds[numberOfRounds - 1]
            .scrambleSetCount
    ).toEqual("10");

    // Remove 1 round
    numberOfRounds--;
    fireEvent.change(roundsSelector, { target: { value: numberOfRounds } });
    expect(store.getState().wcif.events[0].rounds.length).toEqual(
        numberOfRounds
    );
    expect(
        store.getState().wcif.events[0].rounds[numberOfRounds - 1]
            .scrambleSetCount
    ).not.toEqual("10");

    const scrambleSets = inputs[0];
    const copies = inputs[1];

    // Jsdom allow editing even disabled inputs so this test makes sense
    expect(scrambleSets.disabled).toBe(false);
    expect(copies.disabled).toBe(false);

    // There's a harmless change of type here. 1 -> "1"

    // Initial value should be 1
    expect(store.getState().wcif.events[0].rounds[0].scrambleSetCount).toBe(1);

    // Changes to scrambleSet should go to the store
    const newScrambleSets = "3";
    fireEvent.change(scrambleSets, { target: { value: newScrambleSets } });
    expect(store.getState().wcif.events[0].rounds[0].scrambleSetCount).toBe(
        newScrambleSets
    );

    // Initial value should be 1
    expect(
        store.getState().wcif.events[0].rounds[0].extensions[0].data.numCopies
    ).toBe(1);

    // Changes to copies should go to the store
    const newCopies = "5";
    fireEvent.change(copies, { target: { value: newCopies } });
    expect(
        store.getState().wcif.events[0].rounds[0].extensions[0].data.numCopies
    ).toBe(newCopies);
});

it("Editing disabled", () => {
    const store = createStore(Reducer);

    const event = events[0];
    const wcifEvent = defaultWcif.events[0]; // This is one round of 333

    // Enforce that fields are not disabled
    store.dispatch(updateEditingStatus(true));

    // Render component
    act(() => {
        render(
            <Provider store={store}>
                <EventPicker event={event} wcifEvent={wcifEvent} />
            </Provider>,
            container
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

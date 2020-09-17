import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { Reducer } from "../main/redux/Reducers";

import App from "../App";

import { version, formats, events, languages } from "./mock/tnoodle.api.mock";
import { scrambleProgram } from "./mock/wca.api.mock";

const tnoodleApi = require("../main/api/tnoodle.api");
const wcaApi = require("../main/api/wca.api");

let container = null;

let wcif, mbld, password, translations;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Turn on mocking behavior
    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(events)))
    );

    jest.spyOn(tnoodleApi, "fetchFormats").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(formats)))
    );

    jest.spyOn(
        tnoodleApi,
        "fetchAvailableFmcTranslations"
    ).mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(languages)))
    );

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve({
            json: () => Promise.resolve(version),
        })
    );

    jest.spyOn(tnoodleApi, "fetchZip").mockImplementation((...payload) => {
        wcif = payload[0];
        mbld = payload[1];
        password = payload[2];
        translations = payload[3];
        return Promise.resolve(scrambleProgram);
    });

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;

    wcif = null;
    mbld = null;
    password = null;
    translations = null;

    // Clear mock
    tnoodleApi.fetchWcaEvents.mockRestore();
    tnoodleApi.fetchFormats.mockRestore();
    tnoodleApi.fetchAvailableFmcTranslations.mockRestore();
    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Just generate scrambles", async () => {
    const store = createStore(Reducer);

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>,
            container
        );
    });

    const scrambleButton = container.querySelector("form button");
    expect(scrambleButton.innerHTML).toEqual("Generate Scrambles");

    // Generate scrambles
    fireEvent.click(scrambleButton);

    // Only 333
    expect(wcif.events.length).toBe(1);

    expect(password).toBe("");
});

it("Changes on 333, scramble", async () => {
    const store = createStore(Reducer);

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>,
            container
        );
    });

    let selects = Array.from(container.querySelectorAll("select"));

    // We add rounds of 333
    let numberOfRounds = 4;
    fireEvent.change(selects[0], { target: { value: numberOfRounds } });

    // Look for selects again
    selects = Array.from(container.querySelectorAll("select"));

    // Change 2nd round to mo3
    let roundFormat = "3";
    fireEvent.change(selects[2], { target: { value: roundFormat } });

    let inputs = Array.from(container.querySelectorAll("form input"));

    // Change 2nd round
    let scrambleSets = "6";
    let copies = "7";
    fireEvent.change(inputs[4], { target: { value: scrambleSets } });
    fireEvent.change(inputs[5], { target: { value: copies } });

    // Change password
    let newPassword = "wca123";
    fireEvent.change(inputs[1], { target: { value: newPassword } });

    // Generate scrambles
    const scrambleButton = container.querySelector("form button");
    fireEvent.click(scrambleButton);

    // Only 333
    expect(wcif.events.length).toBe(1);

    // Correct number of rounds
    expect(wcif.events[0].rounds.length).toBe(numberOfRounds);

    // Changes should be done to the 2nd round only
    wcif.events[0].rounds.forEach((round, i) => {
        if (i === 1) {
            expect(round.format).toBe(roundFormat);
            expect(round.scrambleSetCount).toBe(scrambleSets);
            expect(round.extensions[0].data.numCopies).toBe(copies);
        } else {
            expect(round.format).toBe("a");
            expect(round.scrambleSetCount).toBe(1);
            expect(round.extensions[0].data.numCopies).toBe(1);
        }

        expect(round.id).toBe("333-r" + (i + 1));

        // We only send 1 extension for now
        expect(round.extensions.length).toBe(1);
    });

    expect(password).toBe(newPassword);
});

import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { Reducer } from "../main/redux/Reducers";

import App from "../App";

import { version, formats, events, languages } from "./mock/tnoodle.api.mock";
import { scrambleProgram, competitions, me, wcifs } from "./mock/wca.api.mock";

import _ from "lodash";

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
    tnoodleApi.fetchZip.mockRestore();
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

it("Remove 333, add FMC and MBLD", async () => {
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

    const mbldEvent = "3x3x3 Multiple Blindfolded";
    const fmcEvent = "3x3x3 Fewest Moves";

    let events = Array.from(container.querySelectorAll("form table"));
    const names = [mbldEvent, fmcEvent];

    let mbldCubes = "70";

    // Pick random indexes from fmc to deselect
    let laguageKeys = Object.keys(languages);
    let numberOfLanguages = laguageKeys.length;

    // At least 1, we do not deselect every translation
    let languagesToDeselect =
        Math.floor(Math.random() * numberOfLanguages - 2) + 1;

    let languagesIndexToDelesect = _.shuffle([
        ...Array(numberOfLanguages).keys(),
    ]).slice(languagesToDeselect);

    events.forEach((event) => {
        let title = event.querySelector("h5").innerHTML;

        let rounds = event.querySelector("select");

        if (names.includes(title)) {
            fireEvent.change(rounds, { target: { value: 3 } });
        } else {
            fireEvent.change(rounds, { target: { value: 0 } });
        }

        let inputs = Array.from(event.querySelectorAll("input"));

        // Change to 70 mbld
        if (title === mbldEvent) {
            fireEvent.change(inputs[inputs.length - 1], {
                target: { value: mbldCubes },
            });
        } else if (title === fmcEvent) {
            // Open translations
            fireEvent.click(event.querySelector("button"));

            // Deselesect random translations
            let checkboxes = event.querySelectorAll("input[type=checkbox]");

            languagesIndexToDelesect.forEach((index) =>
                fireEvent.click(checkboxes[index])
            );
        }
    });

    // Generate scrambles
    const scrambleButton = container.querySelector("form button");
    fireEvent.click(scrambleButton);

    expect(wcif.events.length).toBe(events.length);

    expect(mbld).toBe(mbldCubes);

    let selected = translations
        .filter((translation) => translation.status)
        .map((translation) => translation.id);

    let deselected = translations
        .filter((translation) => !translation.status)
        .map((translation) => translation.id)
        .sort();

    // Deselected should be with status false
    expect(deselected).toEqual(
        languagesIndexToDelesect.map((index) => laguageKeys[index]).sort()
    );

    // Selected and deselected should cover every languages
    expect([...selected, ...deselected].sort()).toStrictEqual(
        laguageKeys.sort()
    );
});

it("Online user", async () => {
    const store = createStore(Reducer);

    jest.spyOn(wcaApi, "isLogged").mockImplementation(() => true);

    jest.spyOn(
        wcaApi,
        "getUpcomingManageableCompetitions"
    ).mockImplementation(() => Promise.resolve(competitions));

    jest.spyOn(wcaApi, "fetchMe").mockImplementation(() => Promise.resolve(me));

    jest.spyOn(
        wcaApi,
        "getCompetitionJson"
    ).mockImplementation((competitionId) =>
        Promise.resolve(wcifs[competitionId])
    );

    jest.spyOn(tnoodleApi, "fetchBestMbldAttempt").mockImplementation(() =>
        Promise.resolve(
            JSON.stringify({ solved: 70, attempted: 70, time: 3012 })
        )
    );

    jest.spyOn(
        tnoodleApi,
        "fetchSuggestedFmcTranslations"
    ).mockImplementation(() =>
        Promise.resolve(JSON.stringify(["de", "es", "pt-BR"]))
    );

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>,
            container
        );
    });

    let competitionButtons = Array.from(
        container.querySelectorAll("ul button")
    );

    // Skip Manual Selection, click the other buttons
    competitionButtons.slice(1, competitionButtons.length).forEach((button) => {
        // Select current competition
        console.log(button.innerHTML);
        fireEvent.click(button);

        let scrambleButton = container.querySelector("form button");
        fireEvent.click(scrambleButton);

        console.log(scrambleButton.innerHTML);

        console.log(wcif);
    });

    wcaApi.isLogged.mockRestore();
    wcaApi.getUpcomingManageableCompetitions.mockRestore();
    wcaApi.fetchMe.mockRestore();
    wcaApi.getCompetitionJson.mockRestore();
    tnoodleApi.fetchBestMbldAttempt.mockRestore();
    tnoodleApi.fetchSuggestedFmcTranslations.mockRestore();
});

import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import store from "../redux/Store";

import Main from "./Main";

const tnoodleApi = require("../api/tnoodle.api");

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

it("There should be only 1 button of type submit", async () => {
    // Define mock objects
    const events = [
        {
            id: "333",
            name: "3x3x3",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "222",
            name: "2x2x2",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "444",
            name: "4x4x4",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "555",
            name: "5x5x5",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "666",
            name: "6x6x6",
            format_ids: ["m", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "777",
            name: "7x7x7",
            format_ids: ["m", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "333bf",
            name: "3x3x3 Blindfolded",
            format_ids: ["3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "333fm",
            name: "3x3x3 Fewest Moves",
            format_ids: ["m", "2", "1"],
            can_change_time_limit: false,
            is_timed_event: false,
            is_fewest_moves: true,
            is_multiple_blindfolded: false,
        },
        {
            id: "333oh",
            name: "3x3x3 One-Handed",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "clock",
            name: "Clock",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "minx",
            name: "Megaminx",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "pyram",
            name: "Pyraminx",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "skewb",
            name: "Skewb",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "sq1",
            name: "Square-1",
            format_ids: ["a", "3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "444bf",
            name: "4x4x4 Blindfolded",
            format_ids: ["3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "555bf",
            name: "5x5x5 Blindfolded",
            format_ids: ["3", "2", "1"],
            can_change_time_limit: true,
            is_timed_event: true,
            is_fewest_moves: false,
            is_multiple_blindfolded: false,
        },
        {
            id: "333mbf",
            name: "3x3x3 Multiple Blindfolded",
            format_ids: ["3", "2", "1"],
            can_change_time_limit: false,
            is_timed_event: false,
            is_fewest_moves: false,
            is_multiple_blindfolded: true,
        },
    ];

    const formats = {
        1: { name: "Best of 1", shortName: "Bo1" },
        2: { name: "Best of 2", shortName: "Bo2" },
        3: { name: "Best of 3", shortName: "Bo3" },
        a: { name: "Average of 5", shortName: "Ao5" },
        m: { name: "Mean of 3", shortName: "Mo3" },
    };

    const languages = {
        da: "Danish",
        de: "German",
        en: "English",
        es: "Spanish",
        et: "Estonian",
        fi: "Finnish",
        fr: "French",
        hr: "Croatian",
        hu: "Hungarian",
        id: "Indonesian",
        it: "Italian",
        ja: "Japanese",
        ko: "Korean",
        pl: "Polish",
        pt: "Portuguese",
        "pt-BR": "Portuguese (Brazil)",
        ro: "Romanian",
        ru: "Russian",
        sl: "Slovenian",
        vi: "Vietnamese",
        "zh-CN": "Chinese (China)",
        "zh-TW": "Chinese (Taiwan)",
    };

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

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <Main />
            </Provider>,
            container
        );
    });

    // Pick all <select>. This will include 17 rounds selector
    // and 1 format selector (for 3x3x3, which already has 1 round)
    const selects = container.querySelectorAll("select");

    // Change all rounds from 0 to 1 (side effect, change 3x3x3 from Ao5 to another value)
    // the objective here is to open all events
    selects.forEach((select) => {
        fireEvent.change(select, {
            target: { value: "1" },
        });
    });

    // Take the form and all the buttons inside of it
    const form = container.querySelector("form");
    const buttons = Array.from(form.querySelectorAll("button"));

    // Click almost all buttons. The point here is to open translations,
    // but it won't hurt click other buttons as well.
    // By avoiding Generate Scrambles button, we avoid triggering zip generation,
    // therefore button text, which is used later.
    buttons
        .filter((button) => button.innerHTML !== "Generate Scrambles")
        .forEach((button) => {
            fireEvent.click(button);
        });

    const completeButtons = Array.from(form.querySelectorAll("button"));

    const buttonsTypeSubmit = completeButtons.filter(
        (button) => button.type === "submit"
    );

    // There can be only 1 button of type submit inside the form
    expect(buttonsTypeSubmit.length).toBe(1);

    // The only submit button must be Generate Scrambles
    const button = buttonsTypeSubmit[0];
    expect(button.innerHTML).toBe("Generate Scrambles");

    // Here we are neglecting the button Select Suggested.
    // To cover it, we should pretend to be logged and with a competition,
    // or change the store
});

import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import store from "../main/redux/Store";
import {
    updateTranslations,
    addSuggestedFmcTranslations,
} from "../main/redux/ActionCreators";

import Main from "../main/components/Main";

import { events, languages } from "./mock/tnoodle.api.mock";

const tnoodleApi = require("../main/api/tnoodle.api");

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

    const formats = {
        1: { name: "Best of 1", shortName: "Bo1" },
        2: { name: "Best of 2", shortName: "Bo2" },
        3: { name: "Best of 3", shortName: "Bo3" },
        a: { name: "Average of 5", shortName: "Ao5" },
        m: { name: "Mean of 3", shortName: "Mo3" },
    };

    // Turn on mocking behavior
    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(events)))
    );

    jest.spyOn(tnoodleApi, "fetchFormats").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(formats)))
    );

    // We add suggested FMC so the button Select Suggested appears as well
    const translations = Object.keys(languages).map((translationId) => ({
        id: translationId,
        display: languages[translationId],
        status: true,
    }));
    const suggestedFmcTranslations = ["de", "en", "pt-BR"];

    store.dispatch(updateTranslations(translations));
    store.dispatch(addSuggestedFmcTranslations(suggestedFmcTranslations));

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
});

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

import App from "../App";

import { events, languages, formats } from "./mock/tnoodle.api.mock";

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

it("There should be only 1 button of type submit, check FMC changes", async () => {
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
                <App />
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
    expect(buttonsTypeSubmit[0].innerHTML).toBe("Generate Scrambles");

    // At first, all translations should be selected
    store.getState().translations.forEach((translation) => {
        expect(translation.status).toEqual(true);
    });

    // Select suggested
    fireEvent.click(completeButtons[completeButtons.length - 1]);
    store.getState().translations.forEach((translation) => {
        expect(translation.status).toEqual(
            suggestedFmcTranslations.indexOf(translation.id) >= 0
        );
    });

    // Select None
    fireEvent.click(completeButtons[completeButtons.length - 2]);
    store.getState().translations.forEach((translation) => {
        expect(translation.status).toEqual(false);
    });

    // Select All
    fireEvent.click(completeButtons[completeButtons.length - 3]);
    store.getState().translations.forEach((translation) => {
        expect(translation.status).toEqual(true);
    });

    // Here, we test just a single random language toggle
    let index = Math.floor(Math.random() * Object.keys(languages).length);
    const checkbox = container.querySelectorAll("input[type=checkbox]")[index];
    expect(checkbox.id).toBe("fmc-" + store.getState().translations[index].id);

    // Check toggle behavior and its value in the store
    expect(checkbox.checked).toBe(true);
    expect(store.getState().translations[index].status).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(store.getState().translations[index].status).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(store.getState().translations[index].status).toBe(true);

    // Clear mock fetchWcaEvents
    tnoodleApi.fetchWcaEvents.mockRestore();
    tnoodleApi.fetchFormats.mockRestore();
    tnoodleApi.fetchAvailableFmcTranslations.mockRestore();
});

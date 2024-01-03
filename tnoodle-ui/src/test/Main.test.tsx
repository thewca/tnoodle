import { render, act, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import tnoodleApi from "../main/api/tnoodle.api";
import wcaApi from "../main/api/wca.api";
import Main from "../main/components/Main";
import { setSuggestedFmcTranslations } from "../main/redux/slice/EventDataSlice";
import {
    colorScheme,
    emptySvg,
    events,
    formats,
    languages,
    scrambleAndImage,
    version,
} from "./mock/tnoodle.api.test.mock";
import { axiosResponse, getNewStore } from "./mock/util.test.mock";
import { scrambleProgram } from "./mock/wca.api.test.mock";
import { getFmcLanguageTags } from "./util/extension.test.util";

let container = document.createElement("div");
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve({ data: version, ...axiosResponse })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ data: scrambleProgram, ...axiosResponse })
    );
});

afterEach(() => {
    // cleanup on exiting
    container.remove();
    container = document.createElement("div");

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
    jest.spyOn(tnoodleApi, "fetchPuzzleColorScheme").mockRestore();
    jest.spyOn(tnoodleApi, "fetchPuzzleRandomScramble").mockRestore();
    jest.spyOn(tnoodleApi, "fetchPuzzleSolvedSvg").mockRestore();
});

it("There should be only 1 button of type submit, check FMC changes", async () => {
    const store = getNewStore();

    // Turn on mocking behavior
    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockImplementation(() =>
        Promise.resolve({
            data: events,
            ...axiosResponse,
        })
    );

    jest.spyOn(tnoodleApi, "fetchFormats").mockImplementation(() =>
        Promise.resolve({ data: formats, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchAvailableFmcTranslations").mockImplementation(
        () => Promise.resolve({ data: languages, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchPuzzleColorScheme").mockImplementation(() =>
        Promise.resolve({ data: colorScheme, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchPuzzleRandomScramble").mockImplementation(() =>
        Promise.resolve({ data: scrambleAndImage, ...axiosResponse })
    );

    jest.spyOn(tnoodleApi, "fetchPuzzleSolvedSvg").mockImplementation(() =>
        Promise.resolve({ data: emptySvg, ...axiosResponse })
    );

    // We add suggested FMC so the button Select Suggested appears as well
    const suggestedFmcTranslations = ["de", "en", "pt-BR"];
    store.dispatch(setSuggestedFmcTranslations(suggestedFmcTranslations));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <Main />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    // Pick all <select>. This will include 17 rounds selector
    // and 1 format selector (for 3x3x3, which already has 1 round)
    const selects = container.querySelectorAll("select");

    // Change all rounds from 0 to 1 (side effect, change 3x3x3 from Ao5 to another value)
    // the objective here is to open all events
    for (let i = 0; i < selects.length; i++) {
        let select = selects[i];
        await act(async () => {
            fireEvent.change(select, {
                target: { value: "1" },
            });
        });
    }

    // Take the form and all the buttons inside of it
    const form = container.querySelector("form")!;
    const buttons = Array.from(form.querySelectorAll("button"));

    // Click almost all buttons. The point here is to open translations,
    // but it won't hurt click other buttons as well.
    // By avoiding Generate Scrambles button, we avoid triggering zip generation,
    // therefore button text, which is used later.
    let almostAllButtons = buttons.filter(
        (button) => button.innerHTML !== "Generate Scrambles"
    );
    for (let i = 0; i < almostAllButtons.length; i++) {
        let button = almostAllButtons[i];
        await act(async () => {
            fireEvent.click(button);
        });
    }

    const completeButtons = Array.from(form.querySelectorAll("button"));
    const buttonsTypeSubmit = completeButtons.filter(
        (button) => button.type === "submit"
    );

    // There can be only 1 button of type submit inside the form
    expect(buttonsTypeSubmit.length).toBe(1);

    // The only submit button must be Generate Scrambles
    expect(buttonsTypeSubmit[0].innerHTML).toBe("Generate Scrambles");

    // At first, there should be no translation information at all
    expect(getFmcLanguageTags(store)).toBeUndefined();

    // Select suggested
    await act(async () => {
        fireEvent.click(completeButtons[completeButtons.length - 1]);
    });

    expect(getFmcLanguageTags(store)).toEqual(suggestedFmcTranslations);

    // Select None
    await act(async () => {
        fireEvent.click(completeButtons[completeButtons.length - 2]);
    });

    expect(getFmcLanguageTags(store)).toEqual([]);

    // Select All
    await act(async () => {
        fireEvent.click(completeButtons[completeButtons.length - 3]);
    });

    expect(getFmcLanguageTags(store)).toEqual(Object.keys(languages));

    // Here, we test just a single random language toggle
    let index = Math.floor(Math.random() * Object.keys(languages).length);
    let language = Object.keys(languages)[index];
    const checkbox = Array.from(
        container.querySelectorAll("input[type=checkbox]")
    )[index] as HTMLInputElement;
    expect(checkbox.id).toBe("fmc-" + language);

    // Check toggle behavior and its value in the store
    expect(checkbox.checked).toBe(true);
    expect(getFmcLanguageTags(store)).toContain(language);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(getFmcLanguageTags(store)).not.toContain(language);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(getFmcLanguageTags(store)).toContain(language);

    // Clear mock fetchWcaEvents
    // Clear mock
    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockRestore();
    jest.spyOn(tnoodleApi, "fetchFormats").mockRestore();
    jest.spyOn(tnoodleApi, "fetchAvailableFmcTranslations").mockRestore();
});

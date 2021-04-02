import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { Reducer } from "../main/redux/Reducers";
import { updateCompetitionId } from "../main/redux/ActionCreators";

import EventPickerTable from "../main/components/EventPickerTable";

import { events, formats, languages } from "./mock/tnoodle.api.mock";
import { competitions } from "./mock/wca.api.mock";

import {
    updateEditingStatus,
    updateWcaEvent,
} from "../main/redux/ActionCreators";

import { getDefaultCopiesExtension } from "../main/util/wcif.util";

import { fireEvent } from "@testing-library/react";

const tnoodleApi = require("../main/api/tnoodle.api");

let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockImplementation(() =>
        Promise.resolve(events)
    );

    jest.spyOn(tnoodleApi, "fetchFormats").mockImplementation(() =>
        Promise.resolve(formats)
    );

    jest.spyOn(
        tnoodleApi,
        "fetchAvailableFmcTranslations"
    ).mockImplementation(() => Promise.resolve(languages));
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;

    // Clear mock
    tnoodleApi.fetchWcaEvents.mockRestore();
    tnoodleApi.fetchFormats.mockRestore();
    tnoodleApi.fetchAvailableFmcTranslations.mockRestore();
});

it("Show editing warn if case of competition selected", async () => {
    const store = createStore(Reducer);

    // Choose a competition
    const competitionId = competitions[0].id;
    store.dispatch(updateCompetitionId(competitionId));

    // Disable editing
    store.dispatch(updateEditingStatus(true));

    // Add one more round
    const newEvent = {
        id: "222",
        rounds: [
            {
                id: "222-r1",
                format: "a",
                scrambleSetCount: 5,
                extensions: [getDefaultCopiesExtension()],
            },
        ],
    };
    store.dispatch(updateWcaEvent(newEvent));

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <EventPickerTable />
            </Provider>,
            container
        );
    });

    const paragraphs = Array.from(container.querySelectorAll("p"));

    // Plural since we have 2 events
    expect(paragraphs[0].innerHTML).toContain("events ");

    // Show link to edit events
    const link = paragraphs[1].querySelector("a");
    expect(link.href).toContain(
        `https://www.worldcubeassociation.org/competitions/${competitionId}/events/edit`
    );

    // Disabled events should not appear
    const tables = Array.from(container.querySelectorAll("table"));
    expect(tables.length).toBe(store.getState().wcif.events.length);
});

it("Singular event", async () => {
    const store = createStore(Reducer);

    // Choose a competition
    const competitionId = competitions[0].id;
    store.dispatch(updateCompetitionId(competitionId));

    // Disable editing
    store.dispatch(updateEditingStatus(true));

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <EventPickerTable />
            </Provider>,
            container
        );
    });

    // Singular for 1 event
    expect(container.querySelector("p").innerHTML).toContain("event ");
});

it("Changes in MBLD should go to the store", async () => {
    const store = createStore(Reducer);

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <EventPickerTable />
            </Provider>,
            container
        );
    });

    const names = ["3x3x3 Multiple Blindfolded"];

    // Increase number of rounds from FMC and MBLD
    const tables = Array.from(container.querySelectorAll("table"))
        .filter(
            (table) => names.indexOf(table.querySelector("h5").innerHTML) >= 0
        )
        .map((table) => {
            let select = table.querySelector("select");
            fireEvent.change(select, { target: { value: 1 } });
            return table;
        });

    // MBLD should be the last table
    const mbldTable = tables[tables.length - 1];
    const mbldInputs = mbldTable.querySelectorAll("input");
    const newMbldScrambles = "70";
    fireEvent.change(mbldInputs[mbldInputs.length - 1], {
        target: { value: newMbldScrambles },
    });

    // It should go to the store
    expect(store.getState().mbld).toBe(newMbldScrambles);
});

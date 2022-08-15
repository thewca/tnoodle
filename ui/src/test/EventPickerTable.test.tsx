import { render, act, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import tnoodleApi from "../main/api/tnoodle.api";
import EventPickerTable from "../main/components/EventPickerTable";
import { setCompetitionId } from "../main/redux/slice/CompetitionSlice";
import { setEditingStatus, setWcaEvent } from "../main/redux/slice/WcifSlice";
import { getDefaultCopiesExtension } from "../main/util/wcif.util";
import { events, formats, languages } from "./mock/tnoodle.api.test.mock";
import { axiosResponse, getNewStore } from "./mock/util.test.mock";
import { competitions } from "./mock/wca.api.test.mock";

let container = document.createElement("div");
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

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
});

afterEach(() => {
    // cleanup on exiting
    container.remove();
    container = document.createElement("div");

    // Clear mock
    jest.spyOn(tnoodleApi, "fetchWcaEvents").mockRestore();
    jest.spyOn(tnoodleApi, "fetchFormats").mockRestore();
    jest.spyOn(tnoodleApi, "fetchAvailableFmcTranslations").mockRestore();
});

it("Show editing warn if case of competition selected", async () => {
    const store = getNewStore();

    // Choose a competition
    const competitionId = competitions[0].id;
    store.dispatch(setCompetitionId(competitionId));

    // Disable editing
    store.dispatch(setEditingStatus(false));

    // Add one more round
    const newEvent = {
        id: "222",
        rounds: [
            {
                id: "222-r1",
                format: "a",
                scrambleSetCount: "5",
                extensions: [getDefaultCopiesExtension()],
            },
        ],
    };
    store.dispatch(setWcaEvent(newEvent));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPickerTable />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    const paragraphs = Array.from(container.querySelectorAll("p"));

    // Plural since we have 2 events
    expect(paragraphs[0].innerHTML).toContain("events ");

    // Show link to edit events
    const link = paragraphs[1].querySelector("a")!;
    expect(link.href).toContain(
        `https://www.worldcubeassociation.org/competitions/${competitionId}/events/edit`
    );

    // Disabled events should not appear
    const tables = Array.from(container.querySelectorAll("table"));
    expect(tables.length).toBe(store.getState().wcifSlice.wcif.events.length);
});

it("Singular event", async () => {
    const store = getNewStore();

    // Choose a competition
    const competitionId = competitions[0].id;
    store.dispatch(setCompetitionId(competitionId));

    // Disable editing
    store.dispatch(setEditingStatus(false));

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPickerTable />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    // Singular for 1 event
    expect(container.querySelector("p")!.innerHTML).toContain("event ");
});

it("Changes in MBLD should go to the store", async () => {
    const store = getNewStore();

    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EventPickerTable />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });
    const names = ["3x3x3 Multiple Blindfolded"];

    // Increase number of rounds from FMC and MBLD
    const tables = Array.from(container.querySelectorAll("table"))
        .filter(
            (table) => names.indexOf(table.querySelector("h5")!.innerHTML) >= 0
        )
        .map((table) => {
            let select = table.querySelector("select")!;
            fireEvent.change(select, { target: { value: 1 } });
            return table;
        });

    // MBLD should be the last table
    const mbldTable = tables[tables.length - 1];
    const mbldInputs = mbldTable.querySelectorAll("input");
    const newMbldScrambles = "70";

    await act(async () => {
        fireEvent.change(mbldInputs[mbldInputs.length - 1], {
            target: { value: newMbldScrambles },
        });
    });

    // It should go to the store
    expect(store.getState().mbldSlice.mbld).toBe(newMbldScrambles);
});

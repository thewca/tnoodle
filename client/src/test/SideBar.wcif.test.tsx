import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import SideBar from "../main/components/SideBar";
import wcaApi from "../main/api/wca.api";
import tnoodleApi from "../main/api/tnoodle.api";
import { axiosResponse, getNewStore } from "./mock/util.test.mock";
import { me } from "./mock/wca.api.test.mock";

let container = document.createElement("div");

beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    container.remove();
    container = document.createElement("div");
});

it("keeps the WCIF competition id when a competition is loaded", async () => {
    const store = getNewStore();

    const competition = { id: "WC2026", name: "WCA World Championship 2026" };
    const wcif = {
        formatVersion: "1.0",
        id: competition.id,
        name: competition.name,
        shortName: "WC 2026",
        events: [],
        persons: [],
        schedule: { numberOfDays: 0, venues: [] },
        extensions: [],
    };

    jest.spyOn(wcaApi, "isLogged").mockImplementation(() => true);
    jest.spyOn(wcaApi, "fetchMe").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: { me } })
    );
    jest.spyOn(wcaApi, "getUpcomingManageableCompetitions").mockImplementation(
        () => Promise.resolve({ ...axiosResponse, data: [competition] })
    );
    jest.spyOn(wcaApi, "getCompetitionJson").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: wcif })
    );
    jest.spyOn(tnoodleApi, "fetchSuggestedFmcTranslations").mockImplementation(
        () => Promise.resolve({ ...axiosResponse, data: [] })
    );
    jest.spyOn(tnoodleApi, "fetchBestMbldAttempt").mockImplementation(() =>
        Promise.resolve({
            ...axiosResponse,
            data: { solved: 0, attempted: 0, time: 0 },
        })
    );

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <SideBar />
            </Provider>,
            { container }
        );
    });

    // Click the competition's button to trigger the load flow
    const compButton = Array.from(container.querySelectorAll("button")).find(
        (b) => b.innerHTML === competition.name
    )!;

    await act(async () => {
        fireEvent.click(compButton);
    });

    expect(store.getState().wcifSlice.wcif.id).toBe("WC2026");

    jest.spyOn(wcaApi, "isLogged").mockRestore();
    jest.spyOn(wcaApi, "fetchMe").mockRestore();
    jest.spyOn(wcaApi, "getUpcomingManageableCompetitions").mockRestore();
    jest.spyOn(wcaApi, "getCompetitionJson").mockRestore();
    jest.spyOn(tnoodleApi, "fetchSuggestedFmcTranslations").mockRestore();
    jest.spyOn(tnoodleApi, "fetchBestMbldAttempt").mockRestore();
});

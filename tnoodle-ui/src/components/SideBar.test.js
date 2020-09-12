import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";

import { Provider } from "react-redux";
import store from "../redux/Store";

import SideBar from "./SideBar";

const wcaApi = require("../api/wca.api");

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

it("Each competition fetched from the website must become a button", async () => {
    // Define mock objects
    const year = new Date().getFullYear();
    const competitions = [
        {
            id: "WCAWorldChampionship" + year,
            name: "WCA World Championship " + year,
        },
        {
            id: "Nationals" + year,
            name: "Nationals " + year,
        },
    ];

    const me = {
        wca_id: "2010AAAA01",
        name: "User Name",
    };

    // Turn on mocking behavior
    jest.spyOn(wcaApi, "isLogged").mockImplementation(() => true);

    jest.spyOn(
        wcaApi,
        "getUpcomingManageableCompetitions"
    ).mockImplementation(() => Promise.resolve(competitions));

    jest.spyOn(wcaApi, "fetchMe").mockImplementation(() => Promise.resolve(me));

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <SideBar />
            </Provider>,
            container
        );
    });

    const buttons = Array.from(container.querySelectorAll("button"));

    // First button should be manual selection
    expect(buttons[0].innerHTML).toBe("Manual Selection");

    // Last button should be Log Out
    expect(buttons[buttons.length - 1].innerHTML).toBe("Log Out");

    // Each competition must have a button
    for (let i = 0; i < competitions.length; i++) {
        expect(competitions[i].name).toBe(buttons[i + 1].innerHTML);
    }

    // We should welcome the user
    const welcome = container.querySelector("p");
    expect(welcome.innerHTML).toContain(me.name);

    // Clear mock
    wcaApi.isLogged.mockRestore();
    wcaApi.getUpcomingManageableCompetitions.mockRestore();
});

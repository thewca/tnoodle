import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";

import { Provider } from "react-redux";
import store from "../main/redux/Store";

import SideBar from "../main/components/SideBar";

import { competitions, me } from "./mock/wca.api.mock";

const wcaApi = require("../main/api/wca.api");

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

    // First button should be svg icon
    expect(buttons[0].innerHTML).toBe(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" d="M4 7h22M4 15h22M4 23h22"></path></svg>`
    );

    // Second button should be manual selection
    expect(buttons[1].innerHTML).toBe("Manual Selection");

    // Last button should be Log Out
    expect(buttons[buttons.length - 1].innerHTML).toBe("Log Out");

    // Each competition must have a button
    for (let i = 0; i < competitions.length; i++) {
        expect(competitions[i].name).toBe(buttons[i + 2].innerHTML);
    }

    // We should welcome the user
    const welcome = container.querySelector("p");
    expect(welcome.innerHTML).toContain(me.name);

    // Clear mock
    wcaApi.isLogged.mockRestore();
    wcaApi.getUpcomingManageableCompetitions.mockRestore();
});

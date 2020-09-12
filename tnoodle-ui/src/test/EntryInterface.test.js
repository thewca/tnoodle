import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent } from "@testing-library/react";

import { Provider } from "react-redux";
import store from "../main/redux/Store";

import EntryInterface from "../main/components/EntryInterface";

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

it("Competition name should be already filled with current date", () => {
    // Render component
    act(() => {
        render(
            <Provider store={store}>
                <EntryInterface />
            </Provider>,
            container
        );
    });

    const today = new Date().toISOString().split("T")[0];

    const competitionNameInput = container.querySelector("#competition-name");
    expect(competitionNameInput.value).toEqual("Scrambles for " + today);
});

it("Password should toggle", () => {
    // Render component
    act(() => {
        render(
            <Provider store={store}>
                <EntryInterface />
            </Provider>,
            container
        );
    });

    const input = container.querySelector("#password");
    const passwordToggler = container.querySelector(".input-group-prepend");

    fireEvent.change(input, { target: { value: "123456" } });

    // Type password at first
    expect(input.type).toBe("password");

    // After the click, it should be type text
    fireEvent.click(passwordToggler);
    expect(input.type).toBe("text");

    expect(input.value).toBe("123456");
});

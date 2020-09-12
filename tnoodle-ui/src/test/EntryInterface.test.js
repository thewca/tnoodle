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

it("Competition name should be already filled with current date and changes should go to the store", () => {
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

    const input = container.querySelector("#competition-name");
    const expected = "Scrambles for " + today;
    expect(input.value).toEqual(expected);

    const typed = "Competition Name 2020";
    fireEvent.change(input, { target: { value: typed } });

    // New competition name should go to the store
    expect(store.getState().wcif.name).toBe(typed);
    expect(store.getState().wcif.shortName).toBe(typed);
});

it("Password should toggle and changes to it should go to the store", () => {
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

    expect(store.getState().password).toBe("");

    const password = "123456";
    fireEvent.change(input, { target: { value: password } });

    // Type password at first
    expect(input.type).toBe("password");

    // After the click, it should be type text
    fireEvent.click(passwordToggler);
    expect(input.type).toBe("text");

    // Password should go to the store
    expect(store.getState().password).toBe(password);
});

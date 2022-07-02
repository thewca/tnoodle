import { render, act, fireEvent } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import EntryInterface from "../main/components/EntryInterface";
import store from "../main/redux/Store";

let container = document.createElement("div");
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    container.remove();
    container = document.createElement("div");
});

it("Competition name should be already filled with current date and changes should go to the store", async () => {
    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EntryInterface />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    const today = new Date().toISOString().split("T")[0];

    const input = document.getElementById(
        "competition-name"
    )! as HTMLInputElement;
    const expected = "Scrambles for " + today;
    expect(input.value).toEqual(expected);

    const typed = "Competition Name 2020";
    fireEvent.change(input, { target: { value: typed } });

    // New competition name should go to the store
    expect(store.getState().wcifSlice.wcif.name).toBe(typed);
    expect(store.getState().wcifSlice.wcif.shortName).toBe(typed);
});

it("Password should toggle and changes to it should go to the store", async () => {
    // Render component
    await act(async () => {
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <EntryInterface />
                </Provider>
            </React.StrictMode>,
            { container }
        );
    });

    const input = container.querySelector("#password")! as HTMLInputElement;
    const passwordToggler = container.querySelector(".input-group-prepend")!;

    expect(store.getState().scramblingSlice.password).toBe("");

    const password = "123456";
    await act(async () => {
        fireEvent.change(input, { target: { value: password } });
    });

    // Type password at first
    expect(input.type).toBe("password");

    // After the click, it should be type text
    await act(async () => {
        fireEvent.click(passwordToggler);
    });

    expect(input.type).toBe("text");

    // Password should go to the store
    expect(store.getState().scramblingSlice.password).toBe(password);
});

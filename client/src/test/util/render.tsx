import { act, render } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import React, { type ReactElement } from "react";
import { Provider } from "react-redux";
import { type AppStore, createStore } from "../../main/redux/Store";
import MockAuthContext from "../mock/MockAuthContext";

interface RenderOptions {
    store?: AppStore;
    isAuthenticated?: boolean;
}

/**
 * Renders `ui` inside the app's providers with a fresh store,
 * and waits for the mocked requests fired on mount to settle.
 */
export const renderWithProviders = async (
    ui: ReactElement,
    { store = createStore(), isAuthenticated = false }: RenderOptions = {},
) => {
    const user = userEvent.setup();

    // `act` flushes the effects and the (already resolved) mocked requests
    // they trigger, so tests can also assert that something is *absent*.
    const result = await act(async () =>
        render(
            <React.StrictMode>
                <Provider store={store}>
                    <MockAuthContext isAuthenticated={isAuthenticated}>
                        {ui}
                    </MockAuthContext>
                </Provider>
            </React.StrictMode>,
        ),
    );

    return { store, user, ...result };
};

/** Replaces the whole content of an input, like selecting it and typing over it. */
export const replaceValue = async (
    user: UserEvent,
    input: HTMLElement,
    value: string | number,
) =>
    user.type(input, String(value), {
        initialSelectionStart: 0,
        initialSelectionEnd: (input as HTMLInputElement).value.length,
    });

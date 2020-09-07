import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";

import { Provider } from "react-redux";
import store from "../redux/Store";

import VersionInfo from "./VersionInfo";

const tnoodleApi = require("../api/tnoodle.api");
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

it("Current version is the correct one", async () => {
    // Define mock objects
    const version = {
        runningVersion: "TNoodle-WCA-2",
        projectName: "TNoodle-WCA",
        projectVersion: "2",
        signedBuild: true,
        signatureKeyBytes: "key",
    };

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-2",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-2.jar",
        },
        allowed: ["TNoodle-WCA-2"],
        history: ["TNoodle-WCA-0", "TNoodle-WCA-1", "TNoodle-WCA-2"],
    };

    // Turn on mocking behavior
    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve({
            json: () => Promise.resolve(version),
        })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // There should be no warning
    const alerts = container.querySelector(".alert");
    expect(alerts).toBe(null);

    // Clear mock
    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

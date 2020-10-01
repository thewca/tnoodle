import React from "react";
import { act } from "react-dom/test-utils";

import { render, unmountComponentAtNode } from "react-dom";

import { Provider } from "react-redux";
import store from "../main/redux/Store";

import VersionInfo from "../main/components/VersionInfo";

const tnoodleApi = require("../main/api/tnoodle.api");
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

it("Current version is the correct one", async () => {
    // Mock objects
    const version = {
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
        publicKeyBytes: "key",
        history: ["TNoodle-WCA-0", "TNoodle-WCA-1", "TNoodle-WCA-2"],
    };

    // Turn on mocking behavior
    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
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
    const alert = container.querySelector(".alert");
    expect(alert).toBe(null);

    // Clear mock
    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Current version is allowed, but it's not the latest one", async () => {
    const version = {
        projectName: "TNoodle-WCA",
        projectVersion: "2",
        signedBuild: true,
        signatureKeyBytes: "key",
    };

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-3",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar",
        },
        allowed: ["TNoodle-WCA-2", "TNoodle-WCA-3"],
        publicKeyBytes: "key",
        history: [
            "TNoodle-WCA-0",
            "TNoodle-WCA-1",
            "TNoodle-WCA-2",
            "TNoodle-WCA-3",
        ],
    };

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // The warning should be "your version is ok, but please upgrade"
    const alert = container.querySelector(".alert-info");
    expect(alert.textContent).toContain("which is still allowed, but you should upgrade to");

    const downloadLink = container.querySelector("a").href;
    expect(downloadLink).toBe(scrambleProgram.current.download);

    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Not signed version alert", async () => {
    const version = {
        projectName: "TNoodle-WCA",
        projectVersion: "3",
        signedBuild: false, // This should trigger an alert, even with currentVersion == runningVersion
        signatureKeyBytes: "key",
    };

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-3",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar",
        },
        allowed: ["TNoodle-WCA-3"],
        publicKeyBytes: "key",
        history: [
            "TNoodle-WCA-0",
            "TNoodle-WCA-1",
            "TNoodle-WCA-2",
            "TNoodle-WCA-3",
        ],
    };

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger");
    expect(alert.textContent).toContain("You are running an unsigned TNoodle release.");

    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Signed with different key", async () => {
    const version = {
        projectName: "TNoodle-WCA",
        projectVersion: "3",
        signedBuild: true,
        signatureKeyBytes: "fooBar", // This should trigger an alert, even with currentVersion == runningVersion
    };

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-3",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar",
        },
        allowed: ["TNoodle-WCA-3"],
        publicKeyBytes: "key",
        history: [
            "TNoodle-WCA-0",
            "TNoodle-WCA-1",
            "TNoodle-WCA-2",
            "TNoodle-WCA-3",
        ],
    };

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger");
    expect(alert.textContent).toContain("You are running an unsigned TNoodle release.");

    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Not allowed TNoodle version, despite it's official", async () => {
    const version = {
        projectName: "TNoodle-WCA",
        projectVersion: "1",
        signedBuild: true,
        signatureKeyBytes: "key",
    };

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-3",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar",
        },
        allowed: ["TNoodle-WCA-2", "TNoodle-WCA-3"],
        publicKeyBytes: "key",
        history: [
            "TNoodle-WCA-0",
            "TNoodle-WCA-1",
            "TNoodle-WCA-2",
            "TNoodle-WCA-3",
        ],
    };

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger");
    expect(alert.textContent).toContain("which is not allowed.");

    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

it("Do not bother the user if we can't be sure", async () => {
    const version = {};

    const scrambleProgram = {
        current: {
            name: "TNoodle-WCA-3",
            information:
                "https://www.worldcubeassociation.org/regulations/scrambles/",
            download:
                "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar",
        },
        allowed: ["TNoodle-WCA-2", "TNoodle-WCA-3"],
        publicKeyBytes: "key",
        history: [
            "TNoodle-WCA-0",
            "TNoodle-WCA-1",
            "TNoodle-WCA-2",
            "TNoodle-WCA-3",
        ],
    };

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        Promise.resolve(version)
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve(scrambleProgram)
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            container
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert");
    expect(alert).toBe(null);

    tnoodleApi.fetchRunningVersion.mockRestore();
    wcaApi.fetchVersionInfo.mockRestore();
});

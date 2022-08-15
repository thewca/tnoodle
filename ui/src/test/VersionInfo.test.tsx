import React from "react";
import { render, act } from "@testing-library/react";

import { Provider } from "react-redux";

import VersionInfo from "../main/components/VersionInfo";
import tnoodleApi from "../main/api/tnoodle.api";
import wcaApi from "../main/api/wca.api";
import store from "../main/redux/Store";
import { axiosResponse } from "./mock/util.test.mock";

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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    // Render component
    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // There should be no warning
    const alert = container.querySelector(".alert");
    expect(alert).toBe(null);

    // Clear mock
    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // The warning should be "your version is ok, but please upgrade"
    const alert = container.querySelector(".alert-info")!;
    expect(alert.textContent).toContain(
        "which is still allowed, but you should upgrade to"
    );

    const downloadLink = container.querySelector("a")!.href;
    expect(downloadLink).toBe(scrambleProgram.current.download);

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger")!;
    expect(alert.textContent).toContain(
        "You are running an unsigned TNoodle release."
    );

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger")!;
    expect(alert.textContent).toContain(
        "You are running an unsigned TNoodle release."
    );

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert-danger")!;
    expect(alert.textContent).toContain("which is not allowed.");

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
});

it("Do not bother the user if we can't be sure", async () => {
    const version = {} as any;

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
        Promise.resolve({ ...axiosResponse, data: version })
    );

    jest.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        Promise.resolve({ ...axiosResponse, data: scrambleProgram })
    );

    await act(async () => {
        render(
            <Provider store={store}>
                <VersionInfo />
            </Provider>,
            { container }
        );
    });

    // The warning should be "do not use this"
    const alert = container.querySelector(".alert");
    expect(alert).toBe(null);

    jest.spyOn(tnoodleApi, "fetchRunningVersion").mockRestore();
    jest.spyOn(wcaApi, "fetchVersionInfo").mockRestore();
});

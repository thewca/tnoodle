import { screen } from "@testing-library/react";
import tnoodleApi from "../main/api/tnoodle.api";
import wcaApi from "../main/api/wca.api";
import type RunningVersion from "../main/model/RunningVersion";
import VersionInfo from "../main/components/VersionInfo";
import { mockApis, ok } from "./mock/api.mock";
import { renderWithProviders } from "./util/render";

const download =
    "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar";

const running = (overrides: Partial<RunningVersion> = {}) => ({
    projectName: "TNoodle-WCA",
    projectVersion: "3",
    signedBuild: true,
    signatureKeyBytes: "key",
    ...overrides,
});

const renderVersionInfo = async (
    runningVersion: RunningVersion,
    allowed: string[],
) => {
    vi.mocked(tnoodleApi.fetchRunningVersion).mockImplementation(() =>
        ok(runningVersion),
    );
    vi.mocked(wcaApi.fetchVersionInfo).mockImplementation(() =>
        ok({
            current: {
                name: "TNoodle-WCA-3",
                information:
                    "https://www.worldcubeassociation.org/regulations/scrambles/",
                download,
            },
            allowed,
            publicKeyBytes: "key",
            history: ["TNoodle-WCA-1", "TNoodle-WCA-2", "TNoodle-WCA-3"],
        }),
    );

    return renderWithProviders(<VersionInfo />);
};

beforeEach(() => mockApis());

it("shows no warning when running the latest signed release", async () => {
    await renderVersionInfo(running(), ["TNoodle-WCA-3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("asks to upgrade when the version is outdated but still allowed", async () => {
    await renderVersionInfo(running({ projectVersion: "2" }), [
        "TNoodle-WCA-2",
        "TNoodle-WCA-3",
    ]);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
        "You are running TNoodle-WCA-2, which is still allowed, but you should upgrade to TNoodle-WCA-3",
    );
    expect(screen.getByRole("link", { name: "here" })).toHaveAttribute(
        "href",
        download,
    );
});

it("forbids versions that are no longer allowed", async () => {
    await renderVersionInfo(running({ projectVersion: "1" }), [
        "TNoodle-WCA-2",
        "TNoodle-WCA-3",
    ]);

    expect(screen.getByRole("alert")).toHaveTextContent(
        "You are running TNoodle-WCA-1, which is not allowed.",
    );
});

it.each([
    ["is not signed", running({ signedBuild: false })],
    ["is signed with a foreign key", running({ signatureKeyBytes: "fooBar" })],
])(
    "warns about an unofficial build when the latest version %s",
    async (_, runningVersion) => {
        await renderVersionInfo(runningVersion, ["TNoodle-WCA-3"]);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "You are running an unsigned TNoodle release.",
        );
    },
);

it("does not bother the user when the running version is unknown", async () => {
    await renderVersionInfo({} as RunningVersion, ["TNoodle-WCA-3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

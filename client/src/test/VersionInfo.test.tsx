import { screen } from "@testing-library/react";
import type { VersionInfo as ApiVersionInfo } from "../main/api/tnoodle.schemas";
import VersionInfo from "../main/components/VersionInfo";
import { testMockServer } from "./mock/api.mock";
import { renderWithProviders } from "./util/render";
import { getVersionInfoHandler } from "../main/api/tnoodle.mocks.ts";
import { getScrambleProgramHandler } from "../main/api/wca.mocks.ts";

const download =
    "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-3.jar";

const running = (overrides: Partial<ApiVersionInfo> = {}) => ({
    project_name: "TNoodle-WCA",
    project_version: "3",
    is_signed_build: true,
    signature_key_bytes: "key",
    ...overrides,
});

const renderVersionInfo = async (
    runningVersion: ApiVersionInfo,
    allowed: string[],
) => {
    testMockServer.use(
        getVersionInfoHandler(runningVersion),
        getScrambleProgramHandler({
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

it("shows no warning when running the latest signed release", async () => {
    await renderVersionInfo(running(), ["TNoodle-WCA-3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("asks to upgrade when the version is outdated but still allowed", async () => {
    await renderVersionInfo(running({ project_version: "2" }), [
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
    await renderVersionInfo(running({ project_version: "1" }), [
        "TNoodle-WCA-2",
        "TNoodle-WCA-3",
    ]);

    expect(screen.getByRole("alert")).toHaveTextContent(
        "You are running TNoodle-WCA-1, which is not allowed.",
    );
});

it.each([
    ["is not signed", running({ is_signed_build: false })],
    [
        "is signed with a foreign key",
        running({ signature_key_bytes: "fooBar" }),
    ],
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
    await renderVersionInfo({} as ApiVersionInfo, ["TNoodle-WCA-3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

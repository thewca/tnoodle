import { screen } from "@testing-library/react";
import type { VersionInfo as ApiVersionInfo } from "../main/api/tnoodle.schemas";
import VersionInfo from "../main/components/VersionInfo";
import { testMockServer } from "./mock/api.mock";
import { renderWithProviders } from "./util/render";
import { getVersionInfoHandler } from "../main/api/tnoodle.mocks.ts";
import { getScrambleProgramHandler } from "../main/api/wca.mocks.ts";

const renderVersionInfo = async (
    runningVersion: Partial<ApiVersionInfo>,
    allowed: string[],
) => {
    testMockServer.use(
        getVersionInfoHandler(runningVersion),
        getScrambleProgramHandler({ allowed }),
    );

    return renderWithProviders(<VersionInfo />);
};

it("shows no warning when running the latest signed release", async () => {
    await renderVersionInfo({}, ["TNoodle-WCA-1.2.3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("asks to upgrade when the version is outdated but still allowed", async () => {
    await renderVersionInfo({ project_version: "1.0.0" }, [
        "TNoodle-WCA-1.0.0",
        "TNoodle-WCA-1.2.3",
    ]);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
        "You are running TNoodle-WCA-1.0.0, which is still allowed, but you should upgrade to TNoodle-WCA-1.2.3",
    );
    expect(screen.getByRole("link", { name: "here" })).toHaveAttribute(
        "href",
        "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-1.2.3.jar",
    );
});

it("forbids versions that are no longer allowed", async () => {
    await renderVersionInfo({ project_version: "1.0.0" }, ["TNoodle-WCA-1.2.3"]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
        "You are running TNoodle-WCA-1.0.0, which is not allowed.",
    );
});

it.each([
    ["is not signed", { is_signed_build: false }],
    [
        "is signed with a foreign key",
        { signature_key_bytes: "fooBar" },
    ],
])(
    "warns about an unofficial build when the latest version %s",
    async (_, runningVersion) => {
        await renderVersionInfo(runningVersion, ["TNoodle-WCA-1.2.3"]);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "You are running an unsigned TNoodle release.",
        );
    },
);

it("does not bother the user when the running version is unknown", async () => {
    await renderVersionInfo({} as ApiVersionInfo, ["TNoodle-WCA-1.2.3"]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import App from "../App";
import tnoodleApi from "../main/api/tnoodle.api";
import wcaApi from "../main/api/wca.api";
import { findExtension } from "../main/util/extension.util";
import { defaultWcif, frontendStatusExtensionId } from "../main/util/wcif.util";
import { mockApis, pending } from "./mock/api.mock";
import { defaultStatus } from "./mock/tnoodle.api.test.mock";
import { competitions, wcifs } from "./mock/wca.api.test.mock";
import {
    getCopies,
    getFmcLanguageTags,
    getMbldCubesCount,
    getRounds,
    scrambledEventIds,
} from "./util/wcif.test.util";
import { renderWithProviders, replaceValue } from "./util/render";

const eventTable = async (name: string) =>
    within(await screen.findByRole("table", { name }));

const generateScrambles = async (user: UserEvent) =>
    await user.click(
        screen.getByRole("button", { name: "Generate Scrambles" }),
    );

const selectCompetition = async (user: UserEvent, name: string) => {
    await user.click(screen.getByRole("button", { name }));
    await screen.findByText(new RegExp(`Found \\d+ events? for ${name}\\.`));
};

beforeEach(() => mockApis());

describe("manual selection", () => {
    it("generates a single round of 3x3x3 by default", async () => {
        const { user } = await renderWithProviders(<App />);

        await generateScrambles(user);

        const { wcif, password } = lastZipRequest();
        expect(scrambledEventIds(wcif)).toEqual(["333"]);
        expect(password).toBe("");
        expect(findExtension(wcif, frontendStatusExtensionId)?.data).toEqual(
            defaultStatus,
        );
    });

    it("sends round settings and the password along", async () => {
        const { user } = await renderWithProviders(<App />);
        const cube = await eventTable("3x3x3");

        await user.selectOptions(cube.getByLabelText("Rounds"), "4");
        await user.selectOptions(cube.getByLabelText("Round 2 format"), "Bo3");
        await replaceValue(
            user,
            cube.getByLabelText("Round 2 scramble sets"),
            6,
        );
        await replaceValue(user, cube.getByLabelText("Round 2 copies"), 7);
        await user.type(screen.getByLabelText("Password"), "wca123");

        await generateScrambles(user);

        const { wcif, password } = lastZipRequest();
        expect(password).toBe("wca123");
        expect(getRounds(wcif, "333")).toEqual([
            expect.objectContaining({
                id: "333-r1",
                format: "a",
                scrambleSetCount: 1,
            }),
            expect.objectContaining({
                id: "333-r2",
                format: "3",
                scrambleSetCount: 6,
            }),
            expect.objectContaining({
                id: "333-r3",
                format: "a",
                scrambleSetCount: 1,
            }),
            expect.objectContaining({
                id: "333-r4",
                format: "a",
                scrambleSetCount: 1,
            }),
        ]);
        expect([0, 1, 2, 3].map((i) => getCopies(wcif, "333", i))).toEqual([
            1, 7, 1, 1,
        ]);
    });

    it("sends MBLD cube count and FMC translations along", async () => {
        const { user, store } = await renderWithProviders(<App />);
        const cube = await eventTable("3x3x3");
        const fmc = await eventTable("3x3x3 Fewest Moves");
        const mbld = await eventTable("3x3x3 Multiple Blindfolded");

        await user.selectOptions(cube.getByLabelText("Rounds"), "0");
        await user.selectOptions(fmc.getByLabelText("Rounds"), "3");
        await user.selectOptions(mbld.getByLabelText("Rounds"), "3");

        await replaceValue(
            user,
            mbld.getByLabelText("Select the number of scrambles"),
            70,
        );

        await user.click(fmc.getByRole("button", { name: "Translations" }));
        await user.click(fmc.getByRole("checkbox", { name: "German" }));
        await user.click(fmc.getByRole("checkbox", { name: "Spanish" }));

        await generateScrambles(user);

        const { wcif } = lastZipRequest();
        expect(scrambledEventIds(wcif)).toEqual(["333fm", "333mbf"]);
        expect(getRounds(wcif, "333fm")).toHaveLength(3);
        expect(getRounds(wcif, "333mbf")).toHaveLength(3);
        expect(getMbldCubesCount(wcif)).toBe(70);
        expect(getFmcLanguageTags(wcif)).toEqual(["de", "es"]);
    });

    it("downloads the generated zip named after the competition", async () => {
        const { user } = await renderWithProviders(<App />);
        const download = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {});

        await replaceValue(
            user,
            screen.getByLabelText("Competition Name"),
            "Noodle Open",
        );
        await generateScrambles(user);
        await user.click(
            await screen.findByRole("button", { name: "Download Scrambles" }),
        );

        await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
        expect(download.mock.contexts[0]).toHaveAttribute(
            "download",
            "Noodle Open.zip",
        );
    });
});

describe("logged in", () => {
    const [firstCompetition, secondCompetition] = competitions;

    it("generates scrambles for the selected competition", async () => {
        const { user } = await renderWithProviders(<App />, {
            isAuthenticated: true,
        });

        for (const competition of competitions) {
            await selectCompetition(user, competition.name);
            await generateScrambles(user);

            expect(lastZipRequest().wcif).toStrictEqual(wcifs[competition.id]);
        }
    });

    it("restores the default events when going back to manual selection", async () => {
        const { user, store } = await renderWithProviders(<App />, {
            isAuthenticated: true,
        });

        await selectCompetition(user, firstCompetition.name);
        await user.click(
            screen.getByRole("button", { name: "Manual Selection" }),
        );

        expect(store.getState().wcifSlice.wcif.events).toStrictEqual(
            defaultWcif.events,
        );
        expect(screen.queryByText(/Found \d+ event/)).not.toBeInTheDocument();
    });

    it("fetches each competition from the WCA only once", async () => {
        const { user } = await renderWithProviders(<App />, {
            isAuthenticated: true,
        });

        await selectCompetition(user, firstCompetition.name);
        await selectCompetition(user, secondCompetition.name);
        await selectCompetition(user, firstCompetition.name);
        await selectCompetition(user, secondCompetition.name);

        expect(wcaApi.getCompetitionJson).toHaveBeenCalledTimes(2);
    });

    it("does not wait for suggested MBLD and FMC settings to generate scrambles", async () => {
        vi.mocked(tnoodleApi.fetchBestMbldAttempt).mockReturnValue(pending());
        vi.mocked(tnoodleApi.fetchSuggestedFmcTranslations).mockReturnValue(
            pending(),
        );

        const { user } = await renderWithProviders(<App />, {
            isAuthenticated: true,
        });

        await selectCompetition(user, firstCompetition.name);
        await generateScrambles(user);

        expect(tnoodleApi.fetchZip).toHaveBeenCalledTimes(1);
    });
});

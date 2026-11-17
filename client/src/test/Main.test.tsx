import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import tnoodleApi from "../main/api/tnoodle.api";
import Main from "../main/components/Main";
import { setSuggestedFmcTranslations } from "../main/redux/slice/EventDataSlice";
import { createStore } from "../main/redux/Store";
import { mockApis } from "./mock/api.mock";
import { languages } from "./mock/tnoodle.api.test.mock";
import { getFmcLanguageTags } from "./util/wcif.test.util";
import { renderWithProviders } from "./util/render";

const suggestedTranslations = ["de", "en", "pt-BR"];

const renderMain = async () => {
    const store = createStore();
    store.dispatch(setSuggestedFmcTranslations(suggestedTranslations));

    const rendered = await renderWithProviders(<Main />, { store });
    const fmcLanguageTags = () =>
        getFmcLanguageTags(store.getState().wcifSlice.wcif);

    return { ...rendered, fmcLanguageTags };
};

const openFmcTranslations = async (user: UserEvent) => {
    const fmc = within(
        await screen.findByRole("table", { name: "3x3x3 Fewest Moves" }),
    );
    await user.selectOptions(fmc.getByLabelText("Rounds"), "1");
    await user.click(fmc.getByRole("button", { name: "Translations" }));
    return fmc;
};

beforeEach(() => mockApis());

it("only submits the form through the Generate Scrambles button", async () => {
    const { user } = await renderMain();
    const fmc = await openFmcTranslations(user);

    // All of these live inside the form, so they must not submit it
    await user.click(fmc.getByRole("checkbox", { name: "German" }));
    for (const name of [
        "Show password",
        "Select All",
        "Select None",
        "Select Suggested",
        "Translations",
    ]) {
        await user.click(screen.getByRole("button", { name }));
    }
    expect(tnoodleApi.fetchZip).not.toHaveBeenCalled();

    await user.click(
        screen.getByRole("button", { name: "Generate Scrambles" }),
    );
    expect(tnoodleApi.fetchZip).toHaveBeenCalledTimes(1);
});

describe("FMC translations", () => {
    it("start with the suggested translations", async () => {
        const { user, fmcLanguageTags } = await renderMain();
        const fmc = await openFmcTranslations(user);

        expect(fmcLanguageTags()).toEqual(suggestedTranslations);
        expect(fmc.getByRole("checkbox", { name: "German" })).toBeChecked();
        expect(fmc.getByRole("checkbox", { name: "French" })).not.toBeChecked();
    });

    it("can be bulk selected", async () => {
        const { user, fmcLanguageTags } = await renderMain();
        const fmc = await openFmcTranslations(user);

        await user.click(fmc.getByRole("button", { name: "Select None" }));
        expect(fmcLanguageTags()).toEqual([]);
        expect(fmc.queryAllByRole("checkbox", { checked: true })).toHaveLength(
            0,
        );

        await user.click(fmc.getByRole("button", { name: "Select All" }));
        expect(fmcLanguageTags()).toEqual(Object.keys(languages));
        expect(fmc.queryAllByRole("checkbox", { checked: false })).toHaveLength(
            0,
        );

        await user.click(fmc.getByRole("button", { name: "Select Suggested" }));
        expect(fmcLanguageTags()).toEqual(suggestedTranslations);
    });

    it("can be toggled one by one", async () => {
        const { user, fmcLanguageTags } = await renderMain();
        const fmc = await openFmcTranslations(user);
        const japanese = fmc.getByRole("checkbox", { name: "Japanese" });

        await user.click(japanese);
        expect(japanese).toBeChecked();
        expect(fmcLanguageTags()).toContain("ja");

        await user.click(japanese);
        expect(japanese).not.toBeChecked();
        expect(fmcLanguageTags()).not.toContain("ja");
    });
});

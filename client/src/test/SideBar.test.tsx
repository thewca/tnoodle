import { screen, within } from "@testing-library/react";
import wcaApi from "../main/api/wca.api";
import SideBar from "../main/components/SideBar";
import { mockApis } from "./mock/api.mock";
import { competitions, me } from "./mock/wca.api.test.mock";
import { renderWithProviders } from "./util/render";

beforeEach(() => mockApis());

describe("when logged in", () => {
    it("welcomes the user and offers their upcoming competitions", async () => {
        await renderWithProviders(<SideBar />, { isAuthenticated: true });

        expect(
            screen.getByText(`Welcome, ${me.name}.`, { exact: false }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Manual Selection" }),
        ).toBeInTheDocument();

        const competitionButtons = within(
            screen.getByRole("group"),
        ).getAllByRole("button");
        expect(competitionButtons.map((button) => button.textContent)).toEqual(
            competitions.map((competition) => competition.name),
        );

        expect(
            screen.getByRole("button", { name: "Log Out" }),
        ).toBeInTheDocument();
    });
});

describe("when logged out", () => {
    it("only offers to log in", async () => {
        await renderWithProviders(<SideBar />);

        expect(
            screen.getByRole("button", { name: "Log In" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Manual Selection" }),
        ).not.toBeInTheDocument();
        expect(wcaApi.getUpcomingManageableCompetitions).not.toHaveBeenCalled();
    });
});

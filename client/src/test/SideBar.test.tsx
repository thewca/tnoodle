import { screen, within } from "@testing-library/react";
import SideBar from "../main/components/SideBar";
import { mockCompetitions } from "./mock/wcif.mock.ts";
import { renderWithProviders } from "./util/render";
import { httpSpy, testMockServer } from "./mock/api.mock.ts";

describe("when logged in", () => {
    it("welcomes the user and offers their upcoming competitions", async () => {
        await renderWithProviders(<SideBar />, { isAuthenticated: true });

        expect(
            screen.getByText("Welcome, John Doe.", { exact: false }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Manual Selection" }),
        ).toBeInTheDocument();

        const competitionButtons = within(
            screen.getByRole("group"),
        ).getAllByRole("button");

        expect(competitionButtons.map((button) => button.textContent)).toEqual(
            mockCompetitions.map((competition) => competition.name),
        );

        expect(
            screen.getByRole("button", { name: "Log Out" }),
        ).toBeInTheDocument();
    });
});

describe("when logged out", () => {
    it("only offers to log in", async () => {
        const routeSpy = httpSpy(testMockServer, "/api/v0/competitions");

        await renderWithProviders(<SideBar />);

        expect(
            screen.getByRole("button", { name: "Log In" }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Manual Selection" }),
        ).not.toBeInTheDocument();

        expect(routeSpy).not.toHaveBeenCalled();
    });
});

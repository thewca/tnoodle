import { screen } from "@testing-library/react";
import EventPickerTable from "../main/components/EventPickerTable";
import { setIsManualSelection } from "../main/redux/slice/InformationSlice";
import { setWcif } from "../main/redux/slice/WcifSlice";
import { createStore } from "../main/redux/Store";
import type { Wcif } from "../main/api/wca.schemas";
import { defaultWcif } from "../main/util/wcif.util";
import { eventsWithNames, mockCompetitions } from "./mock/wcif.mock.ts";
import { renderWithProviders } from "./util/render";
import { getWcaOrigin } from "../main/api/wca.oidc";

const competitionStore = (wcif: Wcif) => {
    const store = createStore();
    store.dispatch(setWcif(wcif));
    store.dispatch(setIsManualSelection(false));
    return store;
};

// Only the top-level tables: nested ones (translations, colors) are unnamed.
const eventTableNames = async () => {
    const allTables = await screen.findAllByRole("table");

    return allTables
        .map((table) => table.getAttribute("aria-label"))
        .filter((name) => name !== null);
};

it("offers every WCA event for manual selection", async () => {
    await renderWithProviders(<EventPickerTable />);

    expect((await eventTableNames()).toSorted()).toEqual(
        Object.values(eventsWithNames).toSorted(),
    );
    expect(screen.queryByText(/Found \d+ event/)).not.toBeInTheDocument();
});

describe("for a competition selected from the WCA", () => {
    const competition = mockCompetitions[0];

    it("only shows the competition's events", async () => {
        await renderWithProviders(<EventPickerTable />, {
            store: competitionStore(competition),
        });

        const competitionEventNames = competition.events.map(
            (event) => eventsWithNames[event.id],
        );

        expect((await eventTableNames()).toSorted()).toEqual(
            competitionEventNames.toSorted(),
        );
        expect(
            screen.getByText(
                `Found ${competition.events.length} events for ${competition.name}.`,
            ),
        ).toBeInTheDocument();
    });

    it("links to the WCA website for editing rounds", async () => {
        await renderWithProviders(<EventPickerTable />, {
            store: competitionStore(competition),
        });

        expect(screen.getByRole("link", { name: "the WCA" })).toHaveAttribute(
            "href",
            `${getWcaOrigin()}/competitions/${competition.id}/events/edit`,
        );
    });

    it("uses singular wording for a single event", async () => {
        await renderWithProviders(<EventPickerTable />, {
            store: competitionStore({
                ...defaultWcif,
                id: "TinyOpen",
                name: "Tiny Open",
            }),
        });

        expect(
            await screen.findByText("Found 1 event for Tiny Open."),
        ).toBeInTheDocument();
    });
});

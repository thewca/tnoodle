import { screen } from "@testing-library/react";
import EventPickerTable from "../main/components/EventPickerTable";
import { setIsManualSelection } from "../main/redux/slice/InformationSlice";
import { setWcif } from "../main/redux/slice/WcifSlice";
import { createStore } from "../main/redux/Store";
import type Wcif from "../main/model/Wcif";
import { defaultWcif } from "../main/util/wcif.util";
import { mockApis } from "./mock/api.mock";
import { events } from "./mock/tnoodle.api.test.mock";
import { competitions, wcifs } from "./mock/wca.api.test.mock";
import { renderWithProviders } from "./util/render";
import { getWcaOrigin } from "../main/api/wca.oidc";

const competitionStore = (wcif: Wcif) => {
    const store = createStore();
    store.dispatch(setWcif(wcif));
    store.dispatch(setIsManualSelection(false));
    return store;
};

// Only the top-level tables: nested ones (translations, colors) are unnamed.
const eventTableNames = () =>
    screen
        .getAllByRole("table")
        .map((table) => table.getAttribute("aria-label"))
        .filter((name) => name !== null);

beforeEach(() => mockApis());

it("offers every WCA event for manual selection", async () => {
    await renderWithProviders(<EventPickerTable />);

    expect(eventTableNames()).toEqual(events.map((event) => event.name));
    expect(screen.queryByText(/Found \d+ event/)).not.toBeInTheDocument();
});

describe("for a competition selected from the WCA", () => {
    const competition = wcifs[competitions[0].id];

    it("only shows the competition's events", async () => {
        await renderWithProviders(<EventPickerTable />, {
            store: competitionStore(competition),
        });

        const competitionEventNames = events
            .filter((event) =>
                competition.events.some(({ id }) => id === event.id),
            )
            .map((event) => event.name);

        expect(eventTableNames()).toEqual(competitionEventNames);
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
            screen.getByText("Found 1 event for Tiny Open."),
        ).toBeInTheDocument();
    });
});

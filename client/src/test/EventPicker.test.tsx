import { act, screen, within } from "@testing-library/react";
import EventPickerTable from "../main/components/EventPickerTable";
import { setBestMbldAttempt } from "../main/redux/slice/EventDataSlice";
import { setIsManualSelection } from "../main/redux/slice/InformationSlice";
import {
    setGeneratingScrambles,
    setScramblingProgressCurrentEvent,
    setScramblingProgressTarget,
} from "../main/redux/slice/ScramblingSlice";
import { createStore } from "../main/redux/Store";
import { mockApis } from "./mock/api.mock";
import { getCopies, getMbldCubesCount, getRounds } from "./util/wcif.test.util";
import { renderWithProviders, replaceValue } from "./util/render";

// EventPicker reads its event from the store through EventPickerTable,
// so we render the table and focus on a single event.
const renderEvents = (store = createStore()) =>
    renderWithProviders(<EventPickerTable />, { store });

const eventTable = (name: string) => screen.getByRole("table", { name });

beforeEach(() => mockApis());

describe("rounds", () => {
    it("adds and removes rounds with default settings", async () => {
        const { store, user } = await renderEvents();
        const cube = within(eventTable("3x3x3"));

        await user.selectOptions(cube.getByLabelText("Rounds"), "4");

        expect(cube.getByLabelText("Round 4 scramble sets")).toHaveValue(1);
        expect(cube.getByLabelText("Round 4 copies")).toHaveValue(1);
        expect(getRounds(store.getState().wcifSlice.wcif, "333")).toHaveLength(
            4,
        );

        await user.selectOptions(cube.getByLabelText("Rounds"), "3");

        expect(
            cube.queryByLabelText("Round 4 scramble sets"),
        ).not.toBeInTheDocument();
        expect(getRounds(store.getState().wcifSlice.wcif, "333")).toHaveLength(
            3,
        );
    });

    it("stores edits to a single round", async () => {
        const { store, user } = await renderEvents();
        const cube = within(eventTable("3x3x3"));

        await user.selectOptions(cube.getByLabelText("Rounds"), "2");
        await user.selectOptions(cube.getByLabelText("Round 2 format"), "Bo3");
        await replaceValue(
            user,
            cube.getByLabelText("Round 2 scramble sets"),
            3,
        );
        await replaceValue(user, cube.getByLabelText("Round 2 copies"), 5);

        const { wcif } = store.getState().wcifSlice;
        const [first, second] = getRounds(wcif, "333");

        expect(second).toMatchObject({ format: "3", scrambleSetCount: 3 });
        expect(getCopies(wcif, "333", 1)).toBe(5);

        expect(first).toMatchObject({ format: "a", scrambleSetCount: 1 });
        expect(getCopies(wcif, "333", 0)).toBe(1);
    });

    it("only allows changing copies for a competition selected from the WCA", async () => {
        const store = createStore();
        store.dispatch(setIsManualSelection(false));

        await renderEvents(store);
        const cube = within(eventTable("3x3x3"));

        expect(cube.getByLabelText("Rounds")).toBeDisabled();
        expect(cube.getByLabelText("Round 1 format")).toBeDisabled();
        expect(cube.getByLabelText("Round 1 scramble sets")).toBeDisabled();
        expect(cube.getByLabelText("Round 1 copies")).toBeEnabled();
    });
});

describe("progress bar", () => {
    it("tracks scramble generation for the event", async () => {
        const { store } = await renderEvents();
        const cube = within(eventTable("3x3x3"));

        expect(cube.queryByRole("progressbar")).not.toBeInTheDocument();

        // Progress is reported by the backend over a websocket
        act(() => {
            store.dispatch(setScramblingProgressTarget({ "333": 3 }));
            store.dispatch(setGeneratingScrambles(true));
        });
        expect(cube.getByRole("progressbar")).toBeInTheDocument();

        act(() => {
            store.dispatch(setScramblingProgressCurrentEvent("333"));
            store.dispatch(setScramblingProgressCurrentEvent("333"));
        });
        expect(cube.getByRole("progressbar")).toHaveTextContent("2 / 3");

        act(() => {
            store.dispatch(setScramblingProgressCurrentEvent("333"));
        });
        expect(cube.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "100",
        );

        act(() => {
            store.dispatch(setGeneratingScrambles(false));
        });
        expect(cube.queryByRole("progressbar")).not.toBeInTheDocument();
    });
});

describe("multi-blind", () => {
    it("stores the requested number of cubes", async () => {
        const { store, user } = await renderEvents();
        const mbld = within(eventTable("3x3x3 Multiple Blindfolded"));

        await user.selectOptions(mbld.getByLabelText("Rounds"), "1");
        await replaceValue(
            user,
            mbld.getByLabelText("Select the number of scrambles"),
            70,
        );

        expect(getMbldCubesCount(store.getState().wcifSlice.wcif)).toBe(70);
    });

    it("warns when requesting fewer cubes than a competitor already attempted", async () => {
        const store = createStore();
        store.dispatch(setBestMbldAttempt(60));

        const { user } = await renderEvents(store);
        const mbld = within(eventTable("3x3x3 Multiple Blindfolded"));

        await user.selectOptions(mbld.getByLabelText("Rounds"), "1");
        const cubes = mbld.getByLabelText("Select the number of scrambles");

        await replaceValue(user, cubes, 60);
        expect(mbld.queryByText(/already tried/)).not.toBeInTheDocument();

        await replaceValue(user, cubes, 50);
        expect(
            mbld.getByText(
                "You selected 50 cubes for Multi-Blind, but there's a competitor who already tried 60 at a competition. Proceed if you are really certain of it.",
            ),
        ).toBeInTheDocument();
    });
});

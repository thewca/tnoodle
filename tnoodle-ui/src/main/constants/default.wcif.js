import { getDefaultCopiesExtension } from "../api/tnoodle.api";

// Add 1 round of 3x3x3
let default333 = {
    id: "333",
    rounds: [
        {
            format: "a",
            id: "333-r1",
            scrambleSetCount: 1,
            extensions: [getDefaultCopiesExtension()],
        },
    ],
};

export const defaultWcif = {
    formatVersion: "1.0",
    name: "",
    shortName: "",
    id: "",
    events: [default333],
    persons: [],
    schedule: { numberOfDays: 0, venues: [] },
};

// Currently, WCA allow up to 4 rounds for each event.
export const MAX_WCA_ROUNDS = 4;

export const MBLD_MIN = 2;

export const FORMATS = {
    "1": { name: "Best of 1", shortName: "Bo1" },
    "2": { name: "Best of 2", shortName: "Bo2" },
    "3": { name: "Best of 3", shortName: "Bo3" },
    a: { name: "Average of 5", shortName: "Ao5" },
    m: { name: "Mean of 3", shortName: "Mo3" }
};

// WCA Events as of 2020/01/01
export const WCA_EVENTS = [
    {
        id: "333",
        name: "3x3x3 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "222",
        name: "2x2x2 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "444",
        name: "4x4x4 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "555",
        name: "5x5x5 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "666",
        name: "6x6x6 Cube",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "777",
        name: "7x7x7 Cube",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "333bf",
        name: "3x3x3 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "333fm",
        name: "3x3x3 Fewest Moves",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: false,
        is_timed_event: false,
        is_fewest_moves: true,
        is_multiple_blindfolded: false
    },
    {
        id: "333oh",
        name: "3x3x3 One-Handed",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "clock",
        name: "Clock",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "minx",
        name: "Megaminx",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "pyram",
        name: "Pyraminx",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "skewb",
        name: "Skewb",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "sq1",
        name: "Square-1",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "444bf",
        name: "4x4x4 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "555bf",
        name: "5x5x5 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
    },
    {
        id: "333mbf",
        name: "3x3x3 Multi-Blind",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: false,
        is_timed_event: false,
        is_fewest_moves: false,
        is_multiple_blindfolded: true
    }
];

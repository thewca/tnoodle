// Copied from https://github.com/thewca/worldcubeassociation.org/blob/master/WcaOnRails/app/javascript/wca/events.js.erb
import _ from "lodash";

export default {
  official: [
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
  ].map(extend),
  byId: _.mapValues(
    {
      "333": {
        id: "333",
        name: "3x3x3 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "222": {
        id: "222",
        name: "2x2x2 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "444": {
        id: "444",
        name: "4x4x4 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "555": {
        id: "555",
        name: "5x5x5 Cube",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "666": {
        id: "666",
        name: "6x6x6 Cube",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "777": {
        id: "777",
        name: "7x7x7 Cube",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "333bf": {
        id: "333bf",
        name: "3x3x3 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "333fm": {
        id: "333fm",
        name: "3x3x3 Fewest Moves",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: false,
        is_timed_event: false,
        is_fewest_moves: true,
        is_multiple_blindfolded: false
      },
      "333oh": {
        id: "333oh",
        name: "3x3x3 One-Handed",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "333ft": {
        id: "333ft",
        name: "3x3x3 With Feet",
        format_ids: ["m", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      clock: {
        id: "clock",
        name: "Clock",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      minx: {
        id: "minx",
        name: "Megaminx",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      pyram: {
        id: "pyram",
        name: "Pyraminx",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      skewb: {
        id: "skewb",
        name: "Skewb",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      sq1: {
        id: "sq1",
        name: "Square-1",
        format_ids: ["a", "3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "444bf": {
        id: "444bf",
        name: "4x4x4 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "555bf": {
        id: "555bf",
        name: "5x5x5 Blindfolded",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "333mbf": {
        id: "333mbf",
        name: "3x3x3 Multi-Blind",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: false,
        is_timed_event: false,
        is_fewest_moves: false,
        is_multiple_blindfolded: true
      },
      magic: {
        id: "magic",
        name: "Magic",
        format_ids: ["a"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      mmagic: {
        id: "mmagic",
        name: "Master Magic",
        format_ids: ["a"],
        can_change_time_limit: true,
        is_timed_event: true,
        is_fewest_moves: false,
        is_multiple_blindfolded: false
      },
      "333mbo": {
        id: "333mbo",
        name: "3x3x3 Multi-Blind Old Style",
        format_ids: ["3", "2", "1"],
        can_change_time_limit: false,
        is_timed_event: false,
        is_fewest_moves: false,
        is_multiple_blindfolded: true
      }
    },
    extend
  )
};

function extend(rawEvent) {
  rawEvent = _.mapKeys(rawEvent, (v, k) => _.camelCase(k));
  return {
    ...rawEvent
  };
}

import {
    createWcif,
    createWcifEvent,
    createWcifExtension,
    createWcifRound,
} from "../../main/api/wca.mocks.ts";
import { testServerWcifVersion } from "./api.mock.ts";

export const eventsWithNames = {
    "333": "3x3x3",
    "222": "2x2x2",
    "444": "4x4x4",
    "555": "5x5x5",
    "666": "6x6x6",
    "777": "7x7x7",
    "333bf": "3x3x3 Blindfolded",
    "333fm": "3x3x3 Fewest Moves",
    "333oh": "3x3x3 One-Handed",
    clock: "Clock",
    minx: "Megaminx",
    pyram: "Pyraminx",
    skewb: "Skewb",
    sq1: "Square-1",
    "444bf": "4x4x4 Blindfolded",
    "555bf": "5x5x5 Blindfolded",
    "333mbf": "3x3x3 Multiple Blindfolded",
} as Record<string, string>;

const year = new Date().getFullYear();

const createCopyExtension = (numCopies: number) =>
    createWcifExtension({
        id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
        data: { numCopies },
    });

export const mockCompetitions = [
    createWcif({
        id: "WCAWorldChampionship" + year,
        formatVersion: testServerWcifVersion,
        name: "WCA World Championship " + year,
        shortName: "WCA World Championship " + year,
        events: [
            createWcifEvent({
                id: "333",
                rounds: [
                    createWcifRound({
                        id: "333-r1",
                        format: "a",
                        scrambleSetCount: 8,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r2",
                        format: "a",
                        scrambleSetCount: 4,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r4",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "222",
                rounds: [
                    createWcifRound({
                        id: "222-r1",
                        format: "a",
                        scrambleSetCount: 5,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "222-r2",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "222-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "444",
                rounds: [
                    createWcifRound({
                        id: "444-r1",
                        format: "a",
                        scrambleSetCount: 6,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "444-r2",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "444-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "555",
                rounds: [
                    createWcifRound({
                        id: "555-r1",
                        format: "a",
                        scrambleSetCount: 3,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "555-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "555-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "666",
                rounds: [
                    createWcifRound({
                        id: "666-r1",
                        format: "m",
                        scrambleSetCount: 8,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "666-r2",
                        format: "m",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "777",
                rounds: [
                    createWcifRound({
                        id: "777-r1",
                        format: "m",
                        scrambleSetCount: 7,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "777-r2",
                        format: "m",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "333bf",
                rounds: [
                    createWcifRound({
                        id: "333bf-r1",
                        format: "3",
                        scrambleSetCount: 3,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333bf-r2",
                        format: "3",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333bf-r3",
                        format: "3",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "333oh",
                rounds: [
                    createWcifRound({
                        id: "333oh-r1",
                        format: "a",
                        scrambleSetCount: 4,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333oh-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333oh-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "clock",
                rounds: [
                    createWcifRound({
                        id: "clock-r1",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "clock-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "minx",
                rounds: [
                    createWcifRound({
                        id: "minx-r1",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "minx-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "pyram",
                rounds: [
                    createWcifRound({
                        id: "pyram-r1",
                        format: "a",
                        scrambleSetCount: 6,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "pyram-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "pyram-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "skewb",
                rounds: [
                    createWcifRound({
                        id: "skewb-r1",
                        format: "a",
                        scrambleSetCount: 4,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "skewb-r2",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "skewb-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "sq1",
                rounds: [
                    createWcifRound({
                        id: "sq1-r1",
                        format: "a",
                        scrambleSetCount: 3,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "sq1-r2",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "sq1-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "444bf",
                rounds: [
                    createWcifRound({
                        id: "444bf-r1",
                        format: "3",
                        scrambleSetCount: 3,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "555bf",
                rounds: [
                    createWcifRound({
                        id: "555bf-r1",
                        format: "3",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "333fm",
                rounds: [
                    createWcifRound({
                        id: "333fm-r1",
                        format: "m",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
                extensions: [
                    createWcifExtension({
                        id: "org.worldcubeassociation.tnoodle.FmcLanguages",
                        data: {
                            languageTags: ["de", "es", "pt-BR"],
                        },
                    }),
                ],
            }),
            createWcifEvent({
                id: "333mbf",
                rounds: [
                    createWcifRound({
                        id: "333mbf-r1",
                        format: "2",
                        scrambleSetCount: 1,
                        extensions: [
                            createCopyExtension(1),
                            createWcifExtension({
                                id: "org.worldcubeassociation.tnoodle.MultiScrambleCount",
                                data: {
                                    requestedScrambles: 60,
                                },
                            }),
                        ],
                    }),
                ],
                extensions: [
                    createWcifExtension({
                        id: "org.worldcubeassociation.tnoodle.MultiScrambleCount",
                        data: {
                            requestedScrambles: 60,
                        },
                    }),
                ],
            }),
        ],
        extensions: [
            createWcifExtension({
                id: "org.worldcubeassociation.tnoodle.CompetitionStatus",
                data: {
                    isAllowedVersion: true,
                    isManual: false,
                    isSignedBuild: true,
                    isStaging: false,
                },
            }),
        ],
    }),
    createWcif({
        id: "Nationals" + year,
        formatVersion: testServerWcifVersion,
        name: "Nationals " + year,
        shortName: "Nationals " + year,
        events: [
            createWcifEvent({
                id: "333",
                rounds: [
                    createWcifRound({
                        id: "333-r1",
                        format: "a",
                        scrambleSetCount: 8,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r2",
                        format: "a",
                        scrambleSetCount: 4,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "333-r4",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "222",
                rounds: [
                    createWcifRound({
                        id: "222-r1",
                        format: "a",
                        scrambleSetCount: 5,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "222-r2",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "222-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
            createWcifEvent({
                id: "444",
                rounds: [
                    createWcifRound({
                        id: "444-r1",
                        format: "a",
                        scrambleSetCount: 6,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "444-r2",
                        format: "a",
                        scrambleSetCount: 2,
                        extensions: [createCopyExtension(1)],
                    }),
                    createWcifRound({
                        id: "444-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [createCopyExtension(1)],
                    }),
                ],
            }),
        ],
        extensions: [
            createWcifExtension({
                id: "org.worldcubeassociation.tnoodle.CompetitionStatus",
                data: {
                    isAllowedVersion: true,
                    isManual: false,
                    isSignedBuild: true,
                    isStaging: false,
                },
            }),
        ],
    }),
];

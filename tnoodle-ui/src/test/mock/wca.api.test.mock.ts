import Wcif from "../../main/model/Wcif";

export const me = {
    wca_id: "2010AAAA01",
    name: "User Name",
};

export const scrambleProgram = {
    current: {
        name: "TNoodle-WCA-2",
        information:
            "https://www.worldcubeassociation.org/regulations/scrambles/",
        download:
            "https://www.worldcubeassociation.org/regulations/scrambles/tnoodle/TNoodle-WCA-2.jar",
    },
    allowed: ["TNoodle-WCA-2"],
    publicKeyBytes: "key",
    history: ["TNoodle-WCA-0", "TNoodle-WCA-1", "TNoodle-WCA-2"],
};

// This file contains only mocks reused.
// Single used mocker are defined within the file.

const year = new Date().getFullYear();
export const competitions = [
    {
        id: "WCAWorldChampionship" + year,
        name: "WCA World Championship " + year,
    },
    {
        id: "Nationals" + year,
        name: "Nationals " + year,
    },
];

export const wcifs: Record<string, Wcif> = {
    [competitions[0].id]: {
        formatVersion: "1.0",
        id: competitions[0].id,
        name: competitions[0].name,
        shortName: competitions[0].name,
        events: [
            {
                id: "333",
                rounds: [
                    {
                        id: "333-r1",
                        format: "a",
                        scrambleSetCount: "8",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "333-r2",
                        format: "a",
                        scrambleSetCount: "4",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "333-r3",
                        format: "a",
                        scrambleSetCount: "1",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "333-r4",
                        format: "a",
                        scrambleSetCount: "1",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                ],
                extensions: [],
            },
            {
                id: "222",
                rounds: [
                    {
                        id: "222-r1",
                        format: "a",
                        scrambleSetCount: "5",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "222-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "222-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "444",
                rounds: [
                    {
                        id: "444-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "6",
                    },
                    {
                        id: "444-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "444-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "555",
                rounds: [
                    {
                        id: "555-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "3",
                    },
                    {
                        id: "555-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "555-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "666",
                rounds: [
                    {
                        id: "666-r1",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "8",
                    },
                    {
                        id: "666-r2",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "777",
                rounds: [
                    {
                        id: "777-r1",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "7",
                    },
                    {
                        id: "777-r2",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "333bf",
                rounds: [
                    {
                        id: "333bf-r1",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "3",
                    },
                    {
                        id: "333bf-r2",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "333bf-r3",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "333fm",
                rounds: [
                    {
                        id: "333fm-r1",
                        format: "m",
                        timeLimit: null,
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "333oh",
                rounds: [
                    {
                        id: "333oh-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "4",
                    },
                    {
                        id: "333oh-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "333oh-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "clock",
                rounds: [
                    {
                        id: "clock-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "clock-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "minx",
                rounds: [
                    {
                        id: "minx-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "minx-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "pyram",
                rounds: [
                    {
                        id: "pyram-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "6",
                    },
                    {
                        id: "pyram-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "pyram-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "skewb",
                rounds: [
                    {
                        id: "skewb-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "4",
                    },
                    {
                        id: "skewb-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "skewb-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "sq1",
                rounds: [
                    {
                        id: "sq1-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "3",
                    },
                    {
                        id: "sq1-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "sq1-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "444bf",
                rounds: [
                    {
                        id: "444bf-r1",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "3",
                    },
                ],
                extensions: [],
            },
            {
                id: "555bf",
                rounds: [
                    {
                        id: "555bf-r1",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                ],
                extensions: [],
            },
            {
                id: "333mbf",
                rounds: [
                    {
                        id: "333mbf-r1",
                        format: "2",
                        timeLimit: null,
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "333ft",
                rounds: [
                    {
                        id: "333ft-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "333ft-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
        ],
        schedule: { numberOfDays: 0, venues: [] },
        persons: [],
        extensions: [
            {
                data: {
                    isAllowedVersion: true,
                    isManual: false,
                    isSignedBuild: true,
                    isStaging: false,
                },
                id: "org.worldcubeassociation.tnoodle.CompetitionStatus",
                specUrl: "",
            },
        ],
    },

    [competitions[1].id]: {
        formatVersion: "1.0",
        id: competitions[1].id,
        name: competitions[1].name,
        shortName: competitions[1].name,
        events: [
            {
                id: "333",
                rounds: [
                    {
                        id: "333-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "8",
                    },
                    {
                        id: "333-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "4",
                    },
                    {
                        id: "333-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                    {
                        id: "333-r4",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "222",
                rounds: [
                    {
                        id: "222-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "5",
                    },
                    {
                        id: "222-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "222-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
            {
                id: "444",
                rounds: [
                    {
                        id: "444-r1",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "6",
                    },
                    {
                        id: "444-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "2",
                    },
                    {
                        id: "444-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id: "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: "1",
                    },
                ],
                extensions: [],
            },
        ],
        schedule: { numberOfDays: 0, venues: [] },
        persons: [],
        extensions: [
            {
                data: {
                    isAllowedVersion: true,
                    isManual: false,
                    isSignedBuild: true,
                    isStaging: false,
                },
                id: "org.worldcubeassociation.tnoodle.CompetitionStatus",
                specUrl: "",
            },
        ],
    },
};

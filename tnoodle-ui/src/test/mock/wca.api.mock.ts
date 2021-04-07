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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "333-r3",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                    {
                        id: "333-r4",
                        format: "a",
                        scrambleSetCount: 1,
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                    },
                ],
            },
            {
                id: "222",
                rounds: [
                    {
                        id: "222-r1",
                        format: "a",
                        scrambleSetCount: 5,
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "222-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 6,
                    },
                    {
                        id: "444-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "444-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 3,
                    },
                    {
                        id: "555-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "555-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 8,
                    },
                    {
                        id: "666-r2",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 7,
                    },
                    {
                        id: "777-r2",
                        format: "m",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 3,
                    },
                    {
                        id: "333bf-r2",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "333bf-r3",
                        format: "3",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 4,
                    },
                    {
                        id: "333oh-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "333oh-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "clock-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "minx-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 6,
                    },
                    {
                        id: "pyram-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "pyram-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 4,
                    },
                    {
                        id: "skewb-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "skewb-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 3,
                    },
                    {
                        id: "sq1-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "sq1-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 3,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "333ft-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
            },
        ],
        schedule: {
            startDate: "2019-07-11",
            numberOfDays: 4,
            venues: [
                {
                    id: 1,
                    name: "Melbourne Convention and Exhibition Centre",
                    latitudeMicrodegrees: -37825214,
                    longitudeMicrodegrees: 144952280,
                    countryIso2: "AU",
                    timezone: "Australia/Melbourne",
                    rooms: [
                        {
                            id: 1,
                            name: "Plenary 1",
                            color: "#00aeff",
                            activities: [
                                {
                                    id: 6,
                                    name: "3x3x3 With Feet, Round 1",
                                    activityCode: "333ft-r1",
                                    startTime: "2019-07-10T23:50:00Z",
                                    endTime: "2019-07-11T00:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 7,
                                    name: "3x3x3 With Feet, Round 2",
                                    activityCode: "333ft-r2",
                                    startTime: "2019-07-11T00:30:00Z",
                                    endTime: "2019-07-11T00:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 8,
                                    name: "Clock, Round 1",
                                    activityCode: "clock-r1",
                                    startTime: "2019-07-11T01:00:00Z",
                                    endTime: "2019-07-11T02:00:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 9,
                                    name: "Square-1, Round 1",
                                    activityCode: "sq1-r1",
                                    startTime: "2019-07-11T02:00:00Z",
                                    endTime: "2019-07-11T03:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 10,
                                    name: "Lunch",
                                    activityCode: "other-lunch",
                                    startTime: "2019-07-11T03:30:00Z",
                                    endTime: "2019-07-11T04:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 11,
                                    name: "6x6x6 Cube, Round 1",
                                    activityCode: "666-r1",
                                    startTime: "2019-07-11T04:30:00Z",
                                    endTime: "2019-07-11T08:10:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 12,
                                    name: "7x7x7 Cube, Round 1",
                                    activityCode: "777-r1",
                                    startTime: "2019-07-11T04:30:00Z",
                                    endTime: "2019-07-11T08:10:00Z",
                                    childActivities: [],
                                },
                            ],
                        },
                        {
                            id: 2,
                            name: "Plenary 2",
                            color: "#304a96",
                            activities: [
                                {
                                    id: 23,
                                    name: "5x5x5 Cube, Round 1",
                                    activityCode: "555-r1",
                                    startTime: "2019-07-11T23:00:00Z",
                                    endTime: "2019-07-12T00:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 24,
                                    name: "4x4x4 Cube, Round 1",
                                    activityCode: "444-r1",
                                    startTime: "2019-07-12T00:45:00Z",
                                    endTime: "2019-07-12T02:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 25,
                                    name: "Lunch",
                                    activityCode: "other-lunch",
                                    startTime: "2019-07-12T02:45:00Z",
                                    endTime: "2019-07-12T03:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 26,
                                    name: "Skewb, Round 1",
                                    activityCode: "skewb-r1",
                                    startTime: "2019-07-12T03:30:00Z",
                                    endTime: "2019-07-12T04:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 27,
                                    name: "Square-1, Round 2",
                                    activityCode: "sq1-r2",
                                    startTime: "2019-07-12T04:45:00Z",
                                    endTime: "2019-07-12T05:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 28,
                                    name: "Pyraminx, Round 1",
                                    activityCode: "pyram-r1",
                                    startTime: "2019-07-12T04:45:00Z",
                                    endTime: "2019-07-12T06:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 29,
                                    name: "Clock, Round 2",
                                    activityCode: "clock-r2",
                                    startTime: "2019-07-12T07:40:00Z",
                                    endTime: "2019-07-12T07:55:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 30,
                                    name: "6x6x6 Cube, Round 2",
                                    activityCode: "666-r2",
                                    startTime: "2019-07-12T07:15:00Z",
                                    endTime: "2019-07-12T07:40:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 31,
                                    name: "7x7x7 Cube, Round 2",
                                    activityCode: "777-r2",
                                    startTime: "2019-07-12T08:10:00Z",
                                    endTime: "2019-07-12T08:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 32,
                                    name: "Square-1, Round 3",
                                    activityCode: "sq1-r3",
                                    startTime: "2019-07-12T07:55:00Z",
                                    endTime: "2019-07-12T08:10:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 33,
                                    name: "Opening Ceremony",
                                    activityCode: "other-misc",
                                    startTime: "2019-07-12T06:45:00Z",
                                    endTime: "2019-07-12T07:15:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 34,
                                    name: "2x2x2 Cube, Round 1",
                                    activityCode: "222-r1",
                                    startTime: "2019-07-12T23:00:00Z",
                                    endTime: "2019-07-13T00:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 35,
                                    name: "3x3x3 One-Handed, Round 1",
                                    activityCode: "333oh-r1",
                                    startTime: "2019-07-13T00:45:00Z",
                                    endTime: "2019-07-13T02:25:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 36,
                                    name: "4x4x4 Cube, Round 2",
                                    activityCode: "444-r2",
                                    startTime: "2019-07-13T01:45:00Z",
                                    endTime: "2019-07-13T02:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 37,
                                    name: "Lunch",
                                    activityCode: "other-lunch",
                                    startTime: "2019-07-13T02:35:00Z",
                                    endTime: "2019-07-13T03:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 38,
                                    name: "3x3x3 Cube, Round 1",
                                    activityCode: "333-r1",
                                    startTime: "2019-07-13T05:20:00Z",
                                    endTime: "2019-07-13T08:00:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 39,
                                    name: "3x3x3 Blindfolded, Round 1",
                                    activityCode: "333bf-r1",
                                    startTime: "2019-07-13T03:30:00Z",
                                    endTime: "2019-07-13T04:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 40,
                                    name: "5x5x5 Cube, Round 2",
                                    activityCode: "555-r2",
                                    startTime: "2019-07-13T08:00:00Z",
                                    endTime: "2019-07-13T08:25:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 41,
                                    name: "Pyraminx, Round 2",
                                    activityCode: "pyram-r2",
                                    startTime: "2019-07-14T01:40:00Z",
                                    endTime: "2019-07-14T02:00:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 42,
                                    name: "Skewb, Round 2",
                                    activityCode: "skewb-r2",
                                    startTime: "2019-07-13T08:25:00Z",
                                    endTime: "2019-07-13T08:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 43,
                                    name: "Dinner",
                                    activityCode: "other-dinner",
                                    startTime: "2019-07-13T08:45:00Z",
                                    endTime: "2019-07-13T09:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 44,
                                    name: "Rubik's Nations Cup 2019",
                                    activityCode: "other-misc",
                                    startTime: "2019-07-13T09:30:00Z",
                                    endTime: "2019-07-13T10:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 45,
                                    name: "3x3x3 Cube, Round 2",
                                    activityCode: "333-r2",
                                    startTime: "2019-07-13T23:00:00Z",
                                    endTime: "2019-07-14T00:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 46,
                                    name: "2x2x2 Cube, Round 2",
                                    activityCode: "222-r2",
                                    startTime: "2019-07-14T00:20:00Z",
                                    endTime: "2019-07-14T01:00:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 47,
                                    name: "3x3x3 One-Handed, Round 2",
                                    activityCode: "333oh-r2",
                                    startTime: "2019-07-14T01:00:00Z",
                                    endTime: "2019-07-14T01:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 48,
                                    name: "3x3x3 Blindfolded, Round 2",
                                    activityCode: "333bf-r2",
                                    startTime: "2019-07-14T01:20:00Z",
                                    endTime: "2019-07-14T01:40:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 50,
                                    name: "3x3x3 Cube, Round 3",
                                    activityCode: "333-r3",
                                    startTime: "2019-07-14T02:00:00Z",
                                    endTime: "2019-07-14T02:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 51,
                                    name: "Lunch",
                                    activityCode: "other-lunch",
                                    startTime: "2019-07-14T02:20:00Z",
                                    endTime: "2019-07-14T03:05:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 52,
                                    name: "Megaminx, Round 2",
                                    activityCode: "minx-r2",
                                    startTime: "2019-07-14T03:05:00Z",
                                    endTime: "2019-07-14T03:25:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 53,
                                    name: "Skewb, Round 3",
                                    activityCode: "skewb-r3",
                                    startTime: "2019-07-14T03:25:00Z",
                                    endTime: "2019-07-14T03:40:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 54,
                                    name: "Pyraminx, Round 3",
                                    activityCode: "pyram-r3",
                                    startTime: "2019-07-14T04:00:00Z",
                                    endTime: "2019-07-14T04:15:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 55,
                                    name: "3x3x3 One-Handed, Round 3",
                                    activityCode: "333oh-r3",
                                    startTime: "2019-07-14T03:40:00Z",
                                    endTime: "2019-07-14T04:00:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 56,
                                    name: "3x3x3 Blindfolded, Round 3",
                                    activityCode: "333bf-r3",
                                    startTime: "2019-07-14T04:35:00Z",
                                    endTime: "2019-07-14T04:55:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 57,
                                    name: "5x5x5 Cube, Round 3",
                                    activityCode: "555-r3",
                                    startTime: "2019-07-14T04:15:00Z",
                                    endTime: "2019-07-14T04:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 58,
                                    name: "4x4x4 Cube, Round 3",
                                    activityCode: "444-r3",
                                    startTime: "2019-07-14T04:55:00Z",
                                    endTime: "2019-07-14T05:15:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 60,
                                    name: "3x3x3 Cube, Round 4",
                                    activityCode: "333-r4",
                                    startTime: "2019-07-14T05:50:00Z",
                                    endTime: "2019-07-14T07:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 62,
                                    name: "Awards",
                                    activityCode: "other-awards",
                                    startTime: "2019-07-14T07:35:00Z",
                                    endTime: "2019-07-14T08:05:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 63,
                                    name: "Megaminx, Round 1",
                                    activityCode: "minx-r1",
                                    startTime: "2019-07-13T04:20:00Z",
                                    endTime: "2019-07-13T05:20:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 64,
                                    name: "2x2x2 Cube, Round 3",
                                    activityCode: "222-r3",
                                    startTime: "2019-07-14T05:15:00Z",
                                    endTime: "2019-07-14T05:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 65,
                                    name: "Break",
                                    activityCode: "other-misc",
                                    startTime: "2019-07-14T05:35:00Z",
                                    endTime: "2019-07-14T05:50:00Z",
                                    childActivities: [],
                                },
                            ],
                        },
                        {
                            id: 3,
                            name: "Room 105",
                            color: "#ff0000",
                            activities: [
                                {
                                    id: 14,
                                    name:
                                        "3x3x3 Fewest Moves, Round 1, Attempt 1",
                                    activityCode: "333fm-r1-a1",
                                    startTime: "2019-07-10T22:30:00Z",
                                    endTime: "2019-07-10T23:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 15,
                                    name:
                                        "3x3x3 Fewest Moves, Round 1, Attempt 2",
                                    activityCode: "333fm-r1-a2",
                                    startTime: "2019-07-11T04:15:00Z",
                                    endTime: "2019-07-11T05:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 16,
                                    name:
                                        "3x3x3 Fewest Moves, Round 1, Attempt 3",
                                    activityCode: "333fm-r1-a3",
                                    startTime: "2019-07-11T08:20:00Z",
                                    endTime: "2019-07-11T09:35:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 17,
                                    name:
                                        "3x3x3 Multi-Blind, Round 1, Attempt 1",
                                    activityCode: "333mbf-r1-a1",
                                    startTime: "2019-07-11T01:30:00Z",
                                    endTime: "2019-07-11T02:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 18,
                                    name: "Multiblind Puzzle Submission",
                                    activityCode: "other-misc",
                                    startTime: "2019-07-10T23:30:00Z",
                                    endTime: "2019-07-11T00:30:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 19,
                                    name: "4x4x4 Blindfolded, Round 1",
                                    activityCode: "444bf-r1",
                                    startTime: "2019-07-11T05:40:00Z",
                                    endTime: "2019-07-11T06:55:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 20,
                                    name: "Multiblind Puzzle Submission",
                                    activityCode: "other-misc",
                                    startTime: "2019-07-11T23:00:00Z",
                                    endTime: "2019-07-11T23:15:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 21,
                                    name:
                                        "3x3x3 Multi-Blind, Round 1, Attempt 2",
                                    activityCode: "333mbf-r1-a2",
                                    startTime: "2019-07-12T00:30:00Z",
                                    endTime: "2019-07-12T01:45:00Z",
                                    childActivities: [],
                                },
                                {
                                    id: 22,
                                    name: "5x5x5 Blindfolded, Round 1",
                                    activityCode: "555bf-r1",
                                    startTime: "2019-07-12T04:05:00Z",
                                    endTime: "2019-07-12T06:00:00Z",
                                    childActivities: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        persons: [],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 8,
                    },
                    {
                        id: "333-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 4,
                    },
                    {
                        id: "333-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                    {
                        id: "333-r4",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 5,
                    },
                    {
                        id: "222-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "222-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
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
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 6,
                    },
                    {
                        id: "444-r2",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 2,
                    },
                    {
                        id: "444-r3",
                        format: "a",
                        extensions: [
                            {
                                data: {
                                    numCopies: "1",
                                },
                                id:
                                    "org.worldcubeassociation.tnoodle.SheetCopyCount",
                                specUrl: "",
                            },
                        ],
                        scrambleSetCount: 1,
                    },
                ],
            },
        ],
        persons: [],
    },
};

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
    history: ["TNoodle-WCA-0", "TNoodle-WCA-1", "TNoodle-WCA-2"],
};

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

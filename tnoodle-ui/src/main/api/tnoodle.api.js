let baseUrl = window.location.origin;
// let baseUrl = "http://localhost:2014";

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

export const fetchZip = (wcif, mbld, password, translations) => {
    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: fmcTranslationsHelper(translations),
    };

    if (!!password) {
        payload.zipPassword = password;
    }

    return postToTnoodle(zipEndpoint, payload)
        .then((response) => response.blob())
        .catch((error) => console.error(error));
};

export const fetchWcaEvents = () => {
    return fetch(baseUrl + wcaEventsEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchFormats = () => {
    return fetch(baseUrl + formatsEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchSuggestedFmcTranslations = (wcif) => {
    return postToTnoodle(suggestedFmcTranslationsEndpoint, wcif)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchBestMbldAttempt = (wcif) => {
    return postToTnoodle(bestMbldAttemptEndpoint, wcif)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchRunningVersion = () => {
    return fetch(baseUrl + versionEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchAvailableFmcTranslations = () => {
    return fetch(baseUrl + fmcTranslationsEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

/**
 * Builds the object expected for FMC translations
 * @param {array} translations e.g. ["de", "da", "pt-BR"]
 */
const fmcTranslationsHelper = (translations) => {
    if (translations == null) {
        return null;
    }
    return {
        languageTags: translations
            .filter((translation) => translation.status)
            .map((translation) => translation.id),
    };
};

const postToTnoodle = (endpoint, payload) =>
    fetch(baseUrl + endpoint, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

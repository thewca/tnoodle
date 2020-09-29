let backendUrl = new URL(window.location.origin);
backendUrl.port = 2014;

export const tNoodleBackend = backendUrl.toString();

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

export const fetchZip = (scrambleClient, wcif, mbld, password, translations) => {
    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: fmcTranslationsHelper(translations),
    };

    if (!!password) {
        payload.zipPassword = password;
    }

    return scrambleClient.loadScrambles(zipEndpoint, payload, wcif.id)
        .then((result) => convertToBlob(result))
        .catch((error) => console.error(error));
};

const convertToBlob = async (result) => {
    let {contentType, payload} = result;
    let res = await fetch(`data:${contentType};base64,${payload}`);

    return await res.blob();
};

export const fetchWcaEvents = () => {
    return fetch(tNoodleBackend + wcaEventsEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchFormats = () => {
    return fetch(tNoodleBackend + formatsEndpoint)
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
    return fetch(tNoodleBackend + versionEndpoint)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

export const fetchAvailableFmcTranslations = () => {
    return fetch(tNoodleBackend + fmcTranslationsEndpoint)
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
    fetch(tNoodleBackend + endpoint, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

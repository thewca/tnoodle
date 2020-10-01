let backendUrl = new URL(window.location.origin);
export const tNoodleBackend = backendUrl.toString().replace(/\/$/g, "");

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

export const fetchZip = (
    scrambleClient,
    wcif,
    mbld,
    password,
    translations
) => {
    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: fmcTranslationsHelper(translations),
    };

    if (!!password) {
        payload.zipPassword = password;
    }

    return scrambleClient
        .loadScrambles(zipEndpoint, payload, wcif.id)
        .then((result) => convertToBlob(result))
        .catch((error) => console.error(error));
};

const convertToBlob = async (result) => {
    let { contentType, payload } = result;
    let res = await fetch(`data:${contentType};base64,${payload}`);

    return await res.blob();
};

export const fetchWcaEvents = async () => {
    const response = await fetch(tNoodleBackend + wcaEventsEndpoint);
    return await response.json();
};

export const fetchFormats = async () => {
    const response = await fetch(tNoodleBackend + formatsEndpoint);
    return await response.json();
};

export const fetchSuggestedFmcTranslations = async (wcif) => {
    const response = await postToTnoodle(
        suggestedFmcTranslationsEndpoint,
        wcif
    );
    return await response.json();
};

export const fetchBestMbldAttempt = async (wcif) => {
    const response = await postToTnoodle(bestMbldAttemptEndpoint, wcif);
    return await response.json();
};

export const fetchRunningVersion = async () => {
    const response = await fetch(tNoodleBackend + versionEndpoint);
    return await response.json();
};

export const fetchAvailableFmcTranslations = async () => {
    const response = await fetch(tNoodleBackend + fmcTranslationsEndpoint);
    return await response.json();
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

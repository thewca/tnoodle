//let baseUrl = window.location.origin;
let baseUrl = "https://secret-atoll-71628.herokuapp.com";

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";

export const fetchZip = (wcif, mbld, password, translations) => {
    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: fmcTranslationsHelper(translations),
    };

    if (password != null && password.length > 0) {
        payload.zipPassword = password;
    }

    return postToTnoodle(zipEndpoint, payload);
};

export const fetchWcaEvents = () => {
    return fetch(baseUrl + wcaEventsEndpoint);
};

export const fetchFormats = () => {
    return fetch(baseUrl + formatsEndpoint);
};

export const fetchSuggestedFmcTranslations = (wcif) => {
    return postToTnoodle(suggestedFmcTranslationsEndpoint, wcif);
};

export const fetchBestMbldAttempt = (wcif) => {
    return postToTnoodle(bestMbldAttemptEndpoint, wcif);
};

export const fetchRunningVersion = () => {
    return fetch(baseUrl + versionEndpoint);
};

/**
 * This is the default extension object the backend expects
 * @param {} copies
 */
export const getDefaultCopiesExtension = (copies = 1) => {
    return {
        id: copiesExtensionId,
        specUrl: "",
        data: {
            numCopies: copies,
        },
    };
};

export const fetchAvailableFmcTranslations = () => {
    return fetch(baseUrl + fmcTranslationsEndpoint);
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

let baseUrl = window.location.origin;
let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcLanguagesEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcLanguagesEndpoint = "/frontend/fmc/languages/competitors";

export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";

export const fetchZip = (wcif, mbld, password, translations) => {
    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: fmcLanguageHelper(translations)
    };

    if (password != null && password.length > 0) {
        payload.zipPassword = password;
    }

    return postToTnoodle(zipEndpoint, payload);
};

export const fetchSuggestedLanguages = wcif => {
    return postToTnoodle(suggestedFmcLanguagesEndpoint, wcif);
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
            numCopies: copies
        }
    };
};

export const fetchAvailableFmcLanguages = () => {
    return fetch(baseUrl + fmcLanguagesEndpoint);
};

/**
 * Builds the object expected for FMC translations
 * @param {*} translations e.g. ["de", "da", "pt-BR"]
 */
const fmcLanguageHelper = translations => {
    if (translations == null) {
        return null;
    }
    return {
        languageTags: translations
            .filter(translation => translation.status)
            .map(translation => translation.id)
    };
};

const postToTnoodle = (endpoint, payload) =>
    fetch(baseUrl + endpoint, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

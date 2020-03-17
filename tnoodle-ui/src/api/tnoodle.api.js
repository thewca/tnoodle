let baseUrl = window.location.origin;
let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let languagesEndpoint = "/frontend/fmc/languages/available";

export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";

export const fetchZip = (wcif, mbld, password, translations) => {
    let url = baseUrl + zipEndpoint;

    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        fmcLanguages: languageHelper(translations)
    };

    if (password != null && password.length > 0) {
        payload.zipPassword = password;
    }

    return fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
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

export const fetchAvailableLanguages = () => {
    return fetch(baseUrl + languagesEndpoint);
};

const languageHelper = translations => {
    if (translations == null) {
        return null;
    }
    return {
        fmcLanguages: translations
            .filter(translation => translation.status)
            .map(translation => translation.id)
    };
};

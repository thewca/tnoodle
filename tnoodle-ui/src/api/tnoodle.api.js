let baseUrl = window.location.origin;
let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";

export const fetchZip = (wcif, mbld, password, translations) => {
    let url = baseUrl + zipEndpoint;

    // TODO find out how translations are expected

    let payload = {
        wcif,
        multiCubes: { requestedScrambles: mbld },
        translations: translations
            .filter(translation => translation.status)
            .map(translation => translation.id)
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
    let url = baseUrl + versionEndpoint;
    return fetch(url);
};

export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";

/**
 * This is the default extension the backend expects
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

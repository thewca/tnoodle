let baseUrl = window.location.origin;
let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";

export const fetchZip = (wcif, mbld, password) => {
    let url = baseUrl + zipEndpoint;

    let payload = { wcif, multiCubes: { requestedScrambles: mbld } };

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

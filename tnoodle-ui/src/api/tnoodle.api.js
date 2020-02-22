export const fetchZip = (wcif, mbld, password) => {
    let payload = { wcif, multiCubes: { requestedScrambles: mbld } };

    if (password != null && password.length > 0) {
        payload.zipPassword = password;
    }

    return fetch("http://localhost:2014/wcif/zip", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
};

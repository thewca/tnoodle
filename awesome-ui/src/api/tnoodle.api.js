export const fetchZip = wcif => {
    return fetch("http://localhost:2014/wcif/zip", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wcif: wcif
        })
    });
};

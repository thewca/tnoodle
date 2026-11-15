export const BASE_PATH = import.meta.env.BASE_URL;

let backendUrl = new URL("http://localhost:2014");
export const tNoodleBackend = backendUrl.toString().replace(/\/$/g, "");

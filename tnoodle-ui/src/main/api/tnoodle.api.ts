import Axios from "axios";
import Translation from "../model/Translation";
import Wcif from "../model/Wcif";
import { ScrambleClient } from "./tnoodle.socket";

let backendUrl = new URL("http://localhost:2014");
export const tNoodleBackend = backendUrl.toString().replace(/\/$/g, "");

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

const convertToBlob = async (result: any) => {
    let { contentType, payload } = result;
    let res = await fetch(`data:${contentType};base64,${payload}`);

    return await res.blob();
};

/**
 * Builds the object expected for FMC translations
 * @param {array} translations e.g. ["de", "da", "pt-BR"]
 */
const fmcTranslationsHelper = (translations?: Translation[]) => {
    if (!translations) {
        return null;
    }
    return {
        languageTags: translations
            .filter((translation) => translation.status)
            .map((translation) => translation.id),
    };
};

class TnoodleApi {
    fetchWcaEvents = () => Axios.get(tNoodleBackend + wcaEventsEndpoint);

    fetchFormats = () => Axios.get(tNoodleBackend + formatsEndpoint);

    fetchSuggestedFmcTranslations = (wcif: Wcif) =>
        Axios.post(tNoodleBackend + suggestedFmcTranslationsEndpoint, wcif);

    fetchBestMbldAttempt = (wcif: Wcif) =>
        Axios.post(tNoodleBackend + bestMbldAttemptEndpoint, wcif);

    fetchRunningVersion = () => Axios.get(tNoodleBackend + versionEndpoint);

    fetchAvailableFmcTranslations = () =>
        Axios.get(tNoodleBackend + fmcTranslationsEndpoint);

    fetchZip = (
        scrambleClient: ScrambleClient,
        wcif: Wcif,
        mbld: string,
        password: string,
        translations?: Translation[]
    ) => {
        let payload = {
            wcif,
            multiCubes: { requestedScrambles: mbld },
            fmcLanguages: fmcTranslationsHelper(translations),
            password,
        };

        return scrambleClient
            .loadScrambles(zipEndpoint, payload, wcif.id)
            .then((result) => convertToBlob(result));
    };
}

const tnoodleApi = new TnoodleApi();
export default tnoodleApi;

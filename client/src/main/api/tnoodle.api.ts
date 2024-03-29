import axios from "axios";
import BestMbld from "../model/BestMbld";
import RunningVersion from "../model/RunningVersion";
import WcaEvent from "../model/WcaEvent";
import WcaFormat from "../model/WcaFormat";
import Wcif from "../model/Wcif";
import { ScrambleClient } from "./tnoodle.socket";
import WebsocketBlobResult from "../model/WebsocketBlobResult";
import ScrambleAndImage from "../model/ScrambleAndImage";

let backendUrl = new URL("http://localhost:2014");
export const tNoodleBackend = backendUrl.toString().replace(/\/$/g, "");

let zipEndpoint = "/wcif/zip";
let versionEndpoint = "/version";
let fmcTranslationsEndpoint = "/frontend/fmc/languages/available";
let suggestedFmcTranslationsEndpoint = "/frontend/fmc/languages/competitors";
let bestMbldAttemptEndpoint = "/frontend/mbld/best";
let puzzleColorSchemeEndpoint = (puzzleId: string) =>
    `/frontend/puzzle/${puzzleId}/colors`;
let puzzleRandomScrambleEndpoint = (puzzleId: string) =>
    `/frontend/puzzle/${puzzleId}/scramble`;
let solvedPuzzleSvgEndpoint = (puzzleId: string) =>
    `/frontend/puzzle/${puzzleId}/svg`;
let wcaEventsEndpoint = "/frontend/data/events";
let formatsEndpoint = "/frontend/data/formats";

class TnoodleApi {
    fetchWcaEvents = () =>
        axios.get<WcaEvent[]>(tNoodleBackend + wcaEventsEndpoint);

    fetchFormats = () =>
        axios.get<Record<string, WcaFormat>>(tNoodleBackend + formatsEndpoint);

    fetchSuggestedFmcTranslations = (wcif: Wcif) =>
        axios.post<string[]>(
            tNoodleBackend + suggestedFmcTranslationsEndpoint,
            wcif
        );

    fetchBestMbldAttempt = (wcif: Wcif) =>
        axios.post<BestMbld>(tNoodleBackend + bestMbldAttemptEndpoint, wcif);

    fetchPuzzleColorScheme = (puzzleId: string) =>
        axios.get<Record<string, string>>(
            tNoodleBackend + puzzleColorSchemeEndpoint(puzzleId)
        );

    fetchPuzzleRandomScramble = (
        puzzleId: string,
        colorScheme: Record<string, string> = {}
    ) =>
        axios.post<ScrambleAndImage>(
            tNoodleBackend + puzzleRandomScrambleEndpoint(puzzleId),
            colorScheme
        );

    fetchPuzzleSolvedSvg = (
        puzzleId: string,
        colorScheme: Record<string, string> = {}
    ) =>
        axios.post<string>(
            tNoodleBackend + solvedPuzzleSvgEndpoint(puzzleId),
            colorScheme
        );

    fetchRunningVersion = () =>
        axios.get<RunningVersion>(tNoodleBackend + versionEndpoint);

    fetchAvailableFmcTranslations = () =>
        axios.get<Record<string, string>>(
            tNoodleBackend + fmcTranslationsEndpoint
        );

    fetchZip = (
        scrambleClient: ScrambleClient,
        wcif: Wcif,
        password: string
    ) => {
        let payload = {
            wcif,
            zipPassword: !password ? null : password,
        };

        return scrambleClient.loadScrambles(zipEndpoint, payload, wcif.id);
    };

    convertToBlob = async (result: WebsocketBlobResult) => {
        let { contentType, payload } = result;
        let res = await fetch(`data:${contentType};base64,${payload}`);

        return await res.blob();
    };
}

const tnoodleApi = new TnoodleApi();
export default tnoodleApi;

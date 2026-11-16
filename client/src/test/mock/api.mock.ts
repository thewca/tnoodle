import { AxiosHeaders, type AxiosResponse } from "axios";
import tnoodleApi from "../../main/api/tnoodle.api";
import wcaApi from "../../main/api/wca.api";
import {
    bestMbldAttempt,
    colorScheme,
    emptySvg,
    events,
    formats,
    languages,
    plainZip,
    scrambleAndImage,
    version,
    wcifTestVersion,
} from "./tnoodle.api.test.mock";
import { competitions, me, scrambleProgram, wcifs } from "./wca.api.test.mock";

/** Wraps data in a successful axios response. */
export const ok = <T>(data: T): Promise<AxiosResponse<T>> =>
    Promise.resolve({
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: new AxiosHeaders() },
    });

/** A request that never comes back, e.g. a slow backend. */
export const pending = <T>(): Promise<T> => new Promise<T>(() => {});

/**
 * Stubs every call to the TNoodle backend and the WCA website with
 * happy-path fixtures. Individual tests override single calls with
 * `vi.mocked(api.method).mockImplementation(...)`.
 * Spies are restored automatically after each test (`restoreMocks`).
 */
export const mockApis = () => {
    vi.spyOn(tnoodleApi, "fetchWcaEvents").mockImplementation(() => ok(events));
    vi.spyOn(tnoodleApi, "fetchFormats").mockImplementation(() => ok(formats));
    vi.spyOn(tnoodleApi, "fetchBackendWcifVersion").mockImplementation(() =>
        ok(wcifTestVersion),
    );
    vi.spyOn(tnoodleApi, "fetchAvailableFmcTranslations").mockImplementation(
        () => ok(languages),
    );
    // Matches the FMC translations stored in the fixture competition WCIFs
    vi.spyOn(tnoodleApi, "fetchSuggestedFmcTranslations").mockImplementation(
        () => ok(["de", "es", "pt-BR"]),
    );
    vi.spyOn(tnoodleApi, "fetchBestMbldAttempt").mockImplementation(() =>
        ok(bestMbldAttempt),
    );
    vi.spyOn(tnoodleApi, "fetchPuzzleColorScheme").mockImplementation(() =>
        ok(colorScheme),
    );
    vi.spyOn(tnoodleApi, "fetchPuzzleRandomScramble").mockImplementation(() =>
        ok(scrambleAndImage),
    );
    vi.spyOn(tnoodleApi, "fetchPuzzleSolvedSvg").mockImplementation(() =>
        ok(emptySvg),
    );
    vi.spyOn(tnoodleApi, "fetchRunningVersion").mockImplementation(() =>
        ok(version),
    );
    vi.spyOn(tnoodleApi, "fetchZip").mockResolvedValue(plainZip);
    vi.spyOn(tnoodleApi, "convertToBlob").mockResolvedValue(new Blob());

    vi.spyOn(wcaApi, "fetchVersionInfo").mockImplementation(() =>
        ok(scrambleProgram),
    );
    vi.spyOn(wcaApi, "fetchMe").mockImplementation(() => ok({ me }));
    vi.spyOn(wcaApi, "getUpcomingManageableCompetitions").mockImplementation(
        () => ok(competitions),
    );
    vi.spyOn(wcaApi, "getCompetitionJson").mockImplementation((competitionId) =>
        ok(wcifs[competitionId]),
    );
};

/** The `[wcif, password]` of the most recent scramble generation request. */
export const lastZipRequest = () => {
    const call = vi.mocked(tnoodleApi.fetchZip).mock.lastCall;

    if (call === undefined) {
        throw new Error("No scrambles were requested");
    }

    const [, wcif, password] = call;
    return { wcif, password };
};

import { AxiosHeaders, type AxiosResponse } from "axios";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { handlers as tnoodleHandlers } from "../../main/api/tnoodle.mocks.ts";
import { handlers as wcaHandlers } from "../../main/api/wca.mocks.ts";
import { mockCompetitions } from "./wcif.mock.ts";

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

export const testServerWcifVersion = "2.2.0"

export const tnoodleMockServer = setupServer(...tnoodleHandlers);

const specificWcifHandlers = mockCompetitions.map((competition) =>
    http.get(
        `*/api/v0/competitions/${competition.id}/wcif/version/${testServerWcifVersion}`,
        () => HttpResponse.json(competition),
    ),
);
export const wcaMockServer = setupServer(...specificWcifHandlers, ...wcaHandlers);

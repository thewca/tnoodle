import { http, HttpResponse } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { handlers as tnoodleHandlers } from "../../main/api/tnoodle.mocks.ts";
import { handlers as wcaHandlers } from "../../main/api/wca.mocks.ts";
import { mockCompetitions } from "./wcif.mock.ts";

export const testServerWcifVersion = "2.2.0";

const specificWcifHandlers = mockCompetitions.map((competition) =>
    http.get(
        `*/api/v0/competitions/${competition.id}/wcif/version/${testServerWcifVersion}`,
        () => HttpResponse.json(competition),
    ),
);

export const testMockServer = setupServer(
    ...specificWcifHandlers,
    ...wcaHandlers,
    ...tnoodleHandlers,
);

export const httpSpy = (server: SetupServer, route: string) => {
    const routeSpy = vi.fn();

    server.use(
        http.all(route, async ({ request }) => {
            const body = await request.json();
            routeSpy(body);
        })
    );

    return routeSpy;
};

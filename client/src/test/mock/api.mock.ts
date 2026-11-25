import { http, HttpResponse, ws } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { handlers as tnoodleHandlers } from "../../main/api/tnoodle.mocks.ts";
import { handlers as wcaHandlers } from "../../main/api/wca.mocks.ts";
import { mockCompetitions, testServerWcifVersion } from "./wcif.mock.ts";
import {
    WEBSOCKET_API,
    WEBSOCKET_ZIP_ENDPOINT,
} from "../../main/api/tnoodle.socket.ts";

const specificWcifHandlers = mockCompetitions.map((competition) =>
    http.get(
        `*/api/v0/competitions/${competition.id}/wcif/version/${testServerWcifVersion}`,
        () => HttpResponse.json(competition),
    ),
);

const zipWebsocket = ws.link(WEBSOCKET_API + WEBSOCKET_ZIP_ENDPOINT);

const fetchZipHandler = zipWebsocket.addEventListener(
    "connection",
    ({ client }) => {
        client.addEventListener("message", (event) => {
            const zipRequest = JSON.parse(event.data.toString());

            // mock target data
            client.send("{}");
            // "computation done" target marker
            client.send(zipRequest.wcif.id);
            // end result: dummy empty zip
            client.send("application/zip");
            client.send("UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==");
        });
    },
);

export const testMockServer = setupServer(
    ...specificWcifHandlers,
    ...wcaHandlers,
    ...tnoodleHandlers,
    fetchZipHandler,
);

export const httpSpy = (
    server: SetupServer,
    route: string,
    withBody: boolean = true,
) => {
    const routeSpy = vi.fn();

    server.use(
        http.all(route, async ({ request }) => {
            const body = withBody ? await request.json() : undefined;
            routeSpy(body);
        }),
    );

    return routeSpy;
};

export const websocketSpy = (server: SetupServer, once: boolean = true) => {
    const routeSpy = vi.fn();

    server.use(
        zipWebsocket.addEventListener("connection", ({ client }) => {
            client.addEventListener(
                "message",
                (event) => {
                    const body = JSON.parse(event.data.toString());
                    routeSpy(body);
                },
                { once },
            );
        }),
    );

    return routeSpy;
};

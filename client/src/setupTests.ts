import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import { testMockServer as server } from "./test/mock/api.mock";
import { cleanup } from "@testing-library/react";

// jsdom does not implement object URLs, which the zip download relies on.
URL.createObjectURL ??= () => "blob:mock";

afterEach(() => {
    // The app keeps the selected competition in the query string,
    // so don't let it leak into the next test.
    window.history.replaceState(null, "", "/");
});

// per https://main.vitest.dev/guide/mocking/requests#configuration
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
afterAll(async () => {
    // keep the server alive for just a bit longer so that `React.StrictMode` can clean up.
    // this will eventually go away with rearchitecting to Tanstack Query in a separate PR.
    await new Promise((resolve) => setTimeout(resolve, 500));

    server.close();
});

import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import { testMockServer as server } from "./test/mock/api.mock";

// jsdom does not implement object URLs, which the zip download relies on.
URL.createObjectURL ??= () => "blob:mock";

afterEach(() => {
    // The app keeps the selected competition in the query string,
    // so don't let it leak into the next test.
    window.history.replaceState(null, "", "/");
});

// per https://main.vitest.dev/guide/mocking/requests#configuration
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

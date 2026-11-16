import "@testing-library/jest-dom/vitest";

// jsdom does not implement object URLs, which the zip download relies on.
URL.createObjectURL ??= () => "blob:mock";

afterEach(() => {
    // The app keeps the selected competition in the query string,
    // so don't let it leak into the next test.
    window.history.replaceState(null, "", "/");
});

export const getQueryParameter = (name: string) => {
    let params = new URLSearchParams(window.location.search);
    return params.get(name);
};

export const getHashParameter = (name: string) => {
    let params = new URLSearchParams(window.location.hash);
    return params.get(name);
};

export const setQueryParameter = (name: string, value: string | number) => {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.set(name, "" + value);
    updateUrl(searchParams);
};

export const deleteParameter = (...names: string[]) => {
    let searchParams = new URLSearchParams(window.location.search);
    names.forEach((name) => searchParams.delete(name));
    updateUrl(searchParams);
};

const updateUrl = (searchParams: URLSearchParams) => {
    let currentLocationWithoutQuery = window.location.href.split("?")[0];
    let url = currentLocationWithoutQuery + "?" + searchParams.toString();
    window.history.pushState(null, "", url);
};

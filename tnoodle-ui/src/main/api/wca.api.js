import { BASE_PATH } from "../../App";
import { getHashParameter, getQueryParameter } from "../util/query.param.util";

// Members of the Software Team can configure this here: https://www.worldcubeassociation.org/oauth/applications/123.

const TNOODLE_ACCESS_TOKEN_KEY = "TNoodle.accessToken";
const TNOODLE_LAST_LOGIN_ENV = "TNoodle.lastLoginEnv";
const TNOODLE_EXPIRATION = "TNoodle.expiration";
const STAGING = "staging";
const PRODUCTION = "production";

const ACCESS_TOKEN = "access_token";
const EXPIRES_IN = "expires_in";

// See https://github.com/thewca/worldcubeassociation.org/wiki/OAuth-documentation-notes#staging-oauth-application
let getWcaOrigin = () => {
    if (isUsingStaging()) {
        return "https://staging.worldcubeassociation.org";
    }
    return (
        process.env.REACT_APP_WCA_ORIGIN ||
        "https://www.worldcubeassociation.org"
    );
};

let getTnoodleAppId = () => {
    if (isUsingStaging()) {
        return "example-application-id";
    }
    return (
        process.env.REACT_APP_TNOODLE_APP_ID ||
        "6145bf3e65fbad4715b049dae2d72a64b8e9a794010abf518fa9364b05a5dd40"
    );
};

let wcaAccessToken = getHashParameter(ACCESS_TOKEN);
let expiresIn = getHashParameter(EXPIRES_IN);
if (!!wcaAccessToken) {
    window.location.hash = "";

    let now = new Date();
    let expiration = now.setSeconds(now.getSeconds() + Number(expiresIn));

    localStorage[TNOODLE_ACCESS_TOKEN_KEY] = wcaAccessToken;
    localStorage[TNOODLE_EXPIRATION] = expiration;

    gotoPreLoginPath();
} else {
    wcaAccessToken = localStorage[TNOODLE_ACCESS_TOKEN_KEY];
    expiresIn = localStorage[TNOODLE_EXPIRATION];
}

export function isUsingStaging() {
    return getQueryParameter("staging") === "true";
}

export function toWcaUrl(path) {
    return `${getWcaOrigin()}${path}`;
}

export function logIn() {
    if (isLogged()) {
        return;
    }

    let redirectUri = window.location.origin + BASE_PATH + "/oauth/wca";
    let logInUrl = toWcaUrl(
        `/oauth/authorize?client_id=${getTnoodleAppId()}&redirect_uri=${redirectUri}&response_type=token&scope=public+manage_competitions`
    );
    localStorage["TNoodle.preLoginHref"] = window.location.href;
    window.location = logInUrl;
}

export function isLogged() {
    if (localStorage[TNOODLE_ACCESS_TOKEN_KEY] == null) {
        return false;
    }

    if (getCurrentEnv() !== getLastLoginEnv()) {
        return false;
    }

    let expiration = localStorage[TNOODLE_EXPIRATION];

    if (expiration == null) {
        return false;
    }

    if (new Date() < new Date(Number(expiration))) {
        return true;
    }

    logOut();
    return false;
}

export function logOut() {
    delete localStorage[TNOODLE_LAST_LOGIN_ENV];
    delete localStorage[TNOODLE_ACCESS_TOKEN_KEY];
    delete localStorage[TNOODLE_EXPIRATION];
    wcaAccessToken = null;
    expiresIn = null;
    window.location.reload();
}

export function gotoPreLoginPath() {
    let preLoginHref = localStorage["TNoodle.preLoginHref"] || "/";
    localStorage[TNOODLE_LAST_LOGIN_ENV] = preLoginHref.includes("staging=true")
        ? STAGING
        : PRODUCTION;
    delete localStorage["TNoodle.preLoginHref"];
    window.location.replace(preLoginHref);
}

export async function fetchMe() {
    const response = await wcaApiFetch("/me");
    const json = await response.json();
    return json.me;
}

export async function fetchVersionInfo() {
    const response = await wcaApiFetch("/scramble-program");
    return await response.json();
}

export async function getCompetitionJson(competitionId) {
    const response = await wcaApiFetch(`/competitions/${competitionId}/wcif`);
    return await response.json();
}

export async function getUpcomingManageableCompetitions() {
    let oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const response = await wcaApiFetch(
        `/competitions?managed_by_me=true&start=${oneWeekAgo.toISOString()}`
    );
    return await response.json();
}

const getLastLoginEnv = () => localStorage[TNOODLE_LAST_LOGIN_ENV];

const getCurrentEnv = () => (isUsingStaging() ? STAGING : PRODUCTION);

async function wcaApiFetch(path, fetchOptions) {
    var baseApiUrl = toWcaUrl("/api/v0");
    fetchOptions = Object.assign({}, fetchOptions, {
        headers: new Headers({
            Authorization: `Bearer ${wcaAccessToken}`,
            "Content-Type": "application/json",
        }),
    });

    const response = await fetch(`${baseApiUrl}${path}`, fetchOptions);
    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response;
}

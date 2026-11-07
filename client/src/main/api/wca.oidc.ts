import { BASE_PATH } from "../../paths";
import type { OidcClientSettings } from "oidc-client-ts";
import { getQueryParameter } from "../util/query.param.util";

export const PRE_LOGIN_STORAGE = "TNoodle.preLoginHref";
export const LAST_LOGIN_ENV_STORAGE = "TNoodle.lastLoginEnv";

export function isUsingStaging() {
    return getQueryParameter("staging") === "true";
}

const STAGING = "staging";
const PRODUCTION = "production";

export function gotoPreLoginPath() {
    let preLoginHref = localStorage[PRE_LOGIN_STORAGE] || "/";
    localStorage[LAST_LOGIN_ENV_STORAGE] = preLoginHref.includes("staging=true")
        ? STAGING
        : PRODUCTION;
    delete localStorage[PRE_LOGIN_STORAGE];
    window.location.replace(preLoginHref);
}

export const getWcaOrigin = () => {
    if (isUsingStaging()) {
        return "https://staging.worldcubeassociation.org";
    }

    return (
        import.meta.env.VITE_WCA_ORIGIN ||
        "https://www.worldcubeassociation.org"
    );
};

const getTnoodleAppId = () => {
    if (isUsingStaging()) {
        return "example-application-id";
    }

    return (
        import.meta.env.VITE_TNOODLE_APP_ID ||
        "6145bf3e65fbad4715b049dae2d72a64b8e9a794010abf518fa9364b05a5dd40"
    );
};

const getLastLoginEnv = () => localStorage[LAST_LOGIN_ENV_STORAGE];

const getCurrentEnv = () => (isUsingStaging() ? STAGING : PRODUCTION);

// Members of the Software Team can configure this here: https://www.worldcubeassociation.org/oauth/applications/123.
const oidcConfig = {
    authority: getWcaOrigin(),
    client_id: getTnoodleAppId(),
    redirect_uri: window.location.origin + BASE_PATH + "/oauth/wca",
    scope: "openid profile public manage_competitions",
} satisfies OidcClientSettings;

export default oidcConfig;

import { BASE_PATH } from "../../paths";
import { type OidcClientSettings, User } from "oidc-client-ts";
import { getQueryParameter } from "../util/query.param.util";

export function isUsingStaging() {
    return getQueryParameter("staging") === "true";
}

export interface CustomAuthState {
    returnSearch?: string;
}

export function gotoPreLoginPath(user?: User) {
    const customState = user?.state as CustomAuthState | undefined;
    const restoredSearch = customState?.returnSearch ?? "";

    window.history.replaceState(
        {},
        document.title,
        window.location.origin + BASE_PATH + restoredSearch,
    );
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
        return "example-application-id-public";
    }

    return (
        import.meta.env.VITE_TNOODLE_APP_ID ||
        "6145bf3e65fbad4715b049dae2d72a64b8e9a794010abf518fa9364b05a5dd40"
    );
};

// Members of the Software Team can configure this here: https://www.worldcubeassociation.org/oauth/applications/123.
const oidcConfig = {
    authority: getWcaOrigin(),
    client_id: getTnoodleAppId(),
    redirect_uri: window.location.origin + BASE_PATH + "/oauth/wca",
    scope: "openid profile public manage_competitions",
} satisfies OidcClientSettings;

export default oidcConfig;

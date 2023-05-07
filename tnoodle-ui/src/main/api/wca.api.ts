import Axios from "axios";
import { BASE_PATH } from "../../App";
import ScrambleProgram from "../model/ScrambleProgram";
import Competition from "../model/Competition";
import Person from "../model/Person";
import Wcif from "../model/Wcif";
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
let expiration: string | null = null;
if (!!wcaAccessToken) {
    window.location.hash = "";

    let now = new Date();
    expiration = now.setSeconds(now.getSeconds() + Number(expiresIn)) + "";

    localStorage[TNOODLE_ACCESS_TOKEN_KEY] = wcaAccessToken;
    localStorage[TNOODLE_EXPIRATION] = expiration;

    gotoPreLoginPath();
} else {
    wcaAccessToken = localStorage[TNOODLE_ACCESS_TOKEN_KEY];
    expiration = localStorage[TNOODLE_EXPIRATION];
}

export function isUsingStaging() {
    return getQueryParameter("staging") === "true";
}

export function toWcaUrl(path: string) {
    return `${getWcaOrigin()}${path}`;
}

export function gotoPreLoginPath() {
    let preLoginHref = localStorage["TNoodle.preLoginHref"] || "/";
    localStorage[TNOODLE_LAST_LOGIN_ENV] = preLoginHref.includes("staging=true")
        ? STAGING
        : PRODUCTION;
    delete localStorage["TNoodle.preLoginHref"];
    window.location.replace(preLoginHref);
}

const getLastLoginEnv = () => localStorage[TNOODLE_LAST_LOGIN_ENV];

const getCurrentEnv = () => (isUsingStaging() ? STAGING : PRODUCTION);

class WcaApi {
    fetchMe = () => this.wcaApiFetch<{ me: Person }>("/me");

    fetchVersionInfo = () =>
        Axios.get<ScrambleProgram>(toWcaUrl("/api/v0/scramble-program"));

    getCompetitionJson = (competitionId: string) =>
        this.wcaApiFetch<Wcif>(`/competitions/${competitionId}/wcif`);

    getUpcomingManageableCompetitions = () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
            managed_by_me: true.toString(),
            start: oneWeekAgo.toISOString(),
        });
        return this.wcaApiFetch<Competition[]>(
            `/competitions?${params.toString()}`
        );
    };

    logOut = () => {
        delete localStorage[TNOODLE_LAST_LOGIN_ENV];
        delete localStorage[TNOODLE_ACCESS_TOKEN_KEY];
        delete localStorage[TNOODLE_EXPIRATION];
        wcaAccessToken = null;
        expiration = null;
        window.location.reload();
    };

    logIn = () => {
        if (this.isLogged()) {
            return;
        }

        let redirectUri = window.location.origin + BASE_PATH + "/oauth/wca";
        let logInUrl = toWcaUrl(
            `/oauth/authorize?client_id=${getTnoodleAppId()}&redirect_uri=${redirectUri}&response_type=token&scope=public+manage_competitions`
        );
        localStorage["TNoodle.preLoginHref"] = window.location.href;
        window.location.href = logInUrl;
    };

    isLogged = () => {
        if (!wcaAccessToken) {
            return false;
        }

        if (getCurrentEnv() !== getLastLoginEnv()) {
            return false;
        }

        if (!expiration) {
            return false;
        }

        if (new Date() < new Date(Number(expiration))) {
            return true;
        }

        this.logOut();
        return false;
    };

    private wcaApiFetch<T>(path: string) {
        var baseApiUrl = toWcaUrl("/api/v0");
        let fetchOptions = {
            headers: {
                Authorization: `Bearer ${wcaAccessToken}`,
                "Content-Type": "application/json",
            },
        };

        return Axios.get<T>(baseApiUrl + path, fetchOptions);
    }
}

const wcaApi = new WcaApi();
export default wcaApi;

import axios from "axios";
import type ScrambleProgram from "../model/ScrambleProgram";
import type Competition from "../model/Competition";
import type Person from "../model/Person";
import type Wcif from "../model/Wcif";
import { getWcaOrigin } from "./wca.oidc";

export function toWcaUrl(path: string) {
    return `${getWcaOrigin()}${path}`;
}

class WcaApi {
    fetchMe = (wcaAccessToken: string) => this.wcaApiFetch<{ me: Person }>("/me", wcaAccessToken);

    fetchVersionInfo = () =>
        axios.get<ScrambleProgram>(toWcaUrl("/api/v0/scramble-program"));

    getCompetitionJson = (competitionId: string, formatVersion: string, wcaAccessToken: string) => {
        return this.wcaApiFetch<Wcif>(
            `/competitions/${competitionId}/wcif/version/${formatVersion}`,
            wcaAccessToken,
        );
    };

    getUpcomingManageableCompetitions = (wcaAccessToken: string) => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
            managed_by_me: true.toString(),
            start: oneWeekAgo.toISOString(),
            sort: "start_date",
        });
        return this.wcaApiFetch<Competition[]>(
            `/competitions?${params.toString()}`,
            wcaAccessToken,
        );
    };

    private wcaApiFetch<T>(path: string, wcaAccessToken: string) {
        var baseApiUrl = toWcaUrl("/api/v0");
        let fetchOptions = {
            headers: {
                Authorization: `Bearer ${wcaAccessToken}`,
                "Content-Type": "application/json",
            },
        };

        return axios.get<T>(baseApiUrl + path, fetchOptions);
    }
}

const wcaApi = new WcaApi();
export default wcaApi;

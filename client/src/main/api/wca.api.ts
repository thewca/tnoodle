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
    private readonly wcaAccessToken: string;

    constructor(token: string) {
        this.wcaAccessToken = token;
    }

    fetchMe = () => this.wcaApiFetch<{ me: Person }>("/me");

    fetchVersionInfo = () =>
        axios.get<ScrambleProgram>(toWcaUrl("/api/v0/scramble-program"));

    getCompetitionJson = (competitionId: string, formatVersion: string) => {
        return this.wcaApiFetch<Wcif>(
            `/competitions/${competitionId}/wcif/version/${formatVersion}`,
        );
    };

    getUpcomingManageableCompetitions = () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
            managed_by_me: true.toString(),
            start: oneWeekAgo.toISOString(),
            sort: "start_date",
        });
        return this.wcaApiFetch<Competition[]>(
            `/competitions?${params.toString()}`,
        );
    };

    private wcaApiFetch<T>(path: string) {
        var baseApiUrl = toWcaUrl("/api/v0");
        let fetchOptions = {
            headers: {
                Authorization: `Bearer ${this.wcaAccessToken}`,
                "Content-Type": "application/json",
            },
        };

        return axios.get<T>(baseApiUrl + path, fetchOptions);
    }
}

export default WcaApi;

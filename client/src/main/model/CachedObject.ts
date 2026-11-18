import type { Wcif } from "../api/wca.redocly.schemas";

export default interface CachedObject {
    bestMbldAttempt: number;
    suggestedFmcTranslations: string[];
    wcif: Wcif;
}

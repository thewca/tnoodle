import type { Wcif } from "../api/wca.schemas";

export default interface CachedObject {
    bestMbldAttempt: number;
    suggestedFmcTranslations: string[];
    wcif: Wcif;
}

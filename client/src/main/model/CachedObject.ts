import Wcif from "./Wcif";

export default interface CachedObject {
    bestMbldAttempt: number;
    suggestedFmcTranslations: string[];
    wcif: Wcif;
}

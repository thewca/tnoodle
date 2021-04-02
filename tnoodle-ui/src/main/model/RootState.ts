import CachedObject from "./CachedObject";
import Competition from "./Competition";
import Me from "./Me";
import Translation from "./Translation";
import WcaEvent from "./WcaEvent";
import Wcif from "./Wcif";

export default interface RootState {
    cachedObjects: Record<string, CachedObject>;
    competitionId: string;
    competitions: Competition[];
    editingDisabled: boolean;
    generatingScrambles: boolean;
    me: Me;
    password: string;
    suggestedFmcTranslations: string[];
    translations: Translation[];
    wcaEvents: WcaEvent[];
    wcif: Wcif;
}

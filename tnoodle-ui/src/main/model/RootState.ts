import Translation from "./Translation";
import WcaEvent from "./WcaEvent";
import Wcif from "./Wcif";

export default interface RootState {
    competitionId: string;
    editingDisabled: boolean;
    generatingScrambles: boolean;
    password: string;
    suggestedFmcTranslations: string[];
    translations: Translation[];
    wcaEvents: WcaEvent[];
    wcif: Wcif;
}

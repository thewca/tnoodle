import WcaEvent from "./WcaEvent";
import Wcif from "./Wcif";

export default interface RootState {
    competitionId: string;
    editingDisabled: boolean;
    generatingScrambles: boolean;
    password: string;
    wcaEvents: WcaEvent[];
    wcif: Wcif;
}

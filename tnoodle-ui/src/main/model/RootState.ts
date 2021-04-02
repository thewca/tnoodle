import Wcif from "./Wcif";

export default interface RootState {
    editingDisabled: boolean;
    generatingScrambles: boolean;
    password: string;
    wcif: Wcif;
}

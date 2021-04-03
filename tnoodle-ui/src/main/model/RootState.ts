import CachedObject from "./CachedObject";
import Competition from "./Competition";
import Person from "./Person";
import Translation from "./Translation";
import WcaEvent from "./WcaEvent";
import WcaFormat from "./WcaFormat";
import Wcif from "./Wcif";

export default interface RootState {
    bestMbldAttempt: number;
    cachedObjects: Record<string, CachedObject>;
    competitionId: string;
    competitions: Competition[];
    editingDisabled: boolean;
    fileZipBlob: Blob;
    generatingScrambles: boolean;
    mbld: string;
    me: Person;
    officialZip: boolean;
    password: string;
    scramblingProgressCurrent: Record<string, number>;
    scramblingProgressTarget: Record<string, number>;
    suggestedFmcTranslations: string[];
    translations: Translation[];
    wcaEvents: WcaEvent[];
    wcaFormats: Record<string, WcaFormat>;
    wcif: Wcif;
}

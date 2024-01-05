import Round from "./Round";
import { Extendable } from "./Extension";

export default interface WcifEvent extends Extendable {
    id: string;
    rounds: Round[];
}

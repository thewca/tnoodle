import type Round from "./Round";
import { type Extendable } from "./Extension";

export default interface WcifEvent extends Extendable {
    id: string;
    rounds: Round[];
}

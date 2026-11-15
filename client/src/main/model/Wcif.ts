import type Person from "./Person";
import type Schedule from "./Schedule";
import type WcifEvent from "./WcifEvent";
import { type Extendable } from "./Extension";

export default interface Wcif extends Extendable {
    events: WcifEvent[];
    formatVersion: string;
    id: string;
    name: string;
    persons: Person[];
    schedule: Schedule;
    shortName: string;
}

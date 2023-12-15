import Person from "./Person";
import Schedule from "./Schedule";
import WcifEvent from "./WcifEvent";
import { Extendable } from "./Extension";

export default interface Wcif extends Extendable {
    events: WcifEvent[];
    formatVersion: string;
    id: string;
    name: string;
    persons: Person[];
    schedule: Schedule;
    shortName: string;
}

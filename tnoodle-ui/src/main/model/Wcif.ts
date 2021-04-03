import Person from "./Person";
import Schedule from "./Schedule";
import WcifEvent from "./WcifEvent";

export default interface Wcif {
    events: WcifEvent[];
    formatVersion: string;
    id: string;
    name: string;
    persons: Person[];
    schedule: Schedule;
    shortName: string;
}

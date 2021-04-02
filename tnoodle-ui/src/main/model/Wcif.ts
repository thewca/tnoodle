import WcifEvent from "./WcifEvent";

export default interface Wcif {
    name: string;
    id: string;
    events: WcifEvent[];
}

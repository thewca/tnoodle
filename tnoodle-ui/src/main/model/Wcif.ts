import WcaEvent from "./WcaEvent";

export default interface Wcif {
    name: string;
    id: string;
    events: WcaEvent[];
}

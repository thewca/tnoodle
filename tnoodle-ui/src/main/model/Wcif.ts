import WcaEvent from "./WcaEvent";

export default interface Wcif {
    name: string;
    events: WcaEvent[];
}

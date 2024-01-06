import { Extendable } from "./Extension";

export default interface Round extends Extendable {
    format: string;
    id: string;
    scrambleSetCount: number;
    timeLimit?: number | null;
}

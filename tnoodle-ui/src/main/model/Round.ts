import Extension from "./Extension";

export default interface Round {
    format: string;
    id: string;
    scrambleSetCount: string;
    extensions: Extension[];
    timeLimit?: number | null;
}

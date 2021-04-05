import Extension from "./Extension";

export default interface Round {
    format: string;
    id: string;
    scrambleSetCount: number;
    extensions: Extension[];
}

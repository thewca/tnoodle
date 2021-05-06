import CurrentTnoodle from "../model/CurrentTnoodle";

export default interface ScrambleProgram {
    current: CurrentTnoodle;
    allowed: string[];
    publicKeyBytes: string;
    history: string[];
}

import type Registration from "./Registration";
import type PersonalBest from "./PersonalBest";

export default interface Person {
    name: string;
    registration: Registration;
    countryIso2: string;
    personalBests: PersonalBest[];
}

import Venue from "./Venue";

export default interface Schedule {
    numberOfDays: number;
    venues: Venue[];
}

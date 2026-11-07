import { competitionName2Id } from "../main/util/competition.name.util";

describe("competitionName2Id", () => {
    it("strips non-word characters", () => {
        expect(competitionName2Id("WCA World Championship 2026")).toBe(
            "WCAWorldChampionship2026"
        );
    });
});

import { getNewStore } from "./mock/util.test.mock";
import {
    setWcif,
    setCompetitionName,
    setCompetitionId,
} from "../main/redux/slice/WcifSlice";
import { defaultWcif } from "../main/util/wcif.util";

describe("WcifSlice", () => {
    it("keeps competition id from the WCIF instead of deriving from name", () => {
        const store = getNewStore();

        // name is not the same as id when stripped of non-word chars
        const wcif = {
            ...defaultWcif,
            id: "WC2026",
            name: "WCA World Championship 2026",
            shortName: "WC 2026",
        };

        store.dispatch(setWcif(wcif));
        store.dispatch(setCompetitionName(wcif.name));
        store.dispatch(setCompetitionId(wcif.id));

        expect(store.getState().wcifSlice.wcif.id).toBe("WC2026");
    });

    it("setCompetitionName does not change the competition id", () => {
        const store = getNewStore();

        store.dispatch(setCompetitionId("WC2026"));
        store.dispatch(setCompetitionName("A Totally Different Name 2026"));

        expect(store.getState().wcifSlice.wcif.id).toBe("WC2026");
    });
});

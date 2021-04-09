import { configureStore } from "@reduxjs/toolkit";
import { competitionSlice } from "./slice/CompetitionSlice";
import { fmcSlice } from "./slice/FmcSlice";
import { informationSlice } from "./slice/InformationSlice";
import { mbldSlice } from "./slice/MbldSlice";
import { scramblingSlice } from "./slice/ScramblingSlice";
import { wcifSlice } from "./slice/WcifSlice";

const store = configureStore({
    reducer: {
        competitionSlice: competitionSlice.reducer,
        fmcSlice: fmcSlice.reducer,
        informationSlice: informationSlice.reducer,
        mbldSlice: mbldSlice.reducer,
        scramblingSlice: scramblingSlice.reducer,
        wcifSlice: wcifSlice.reducer,
    },
});
export default store;

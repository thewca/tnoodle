import { configureStore } from "@reduxjs/toolkit";
import { competitionSlice } from "./slice/CompetitionSlice";
import { informationSlice } from "./slice/InformationSlice";
import { scramblingSlice } from "./slice/ScramblingSlice";
import { wcifSlice } from "./slice/WcifSlice";
import { eventDataSlice } from "./slice/EventDataSlice";

const store = configureStore({
    reducer: {
        competitionSlice: competitionSlice.reducer,
        informationSlice: informationSlice.reducer,
        scramblingSlice: scramblingSlice.reducer,
        wcifSlice: wcifSlice.reducer,
        eventDataSlice: eventDataSlice.reducer,
    },
});
export default store;

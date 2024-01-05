import { configureStore } from "@reduxjs/toolkit";
import { informationSlice } from "./slice/InformationSlice";
import { scramblingSlice } from "./slice/ScramblingSlice";
import { wcifSlice } from "./slice/WcifSlice";
import { eventDataSlice } from "./slice/EventDataSlice";
import { settingsSlice } from "./slice/SettingsSlice";

const store = configureStore({
    reducer: {
        informationSlice: informationSlice.reducer,
        scramblingSlice: scramblingSlice.reducer,
        wcifSlice: wcifSlice.reducer,
        eventDataSlice: eventDataSlice.reducer,
        settingsSlice: settingsSlice.reducer,
    },
});

export default store;

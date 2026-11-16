import { configureStore } from "@reduxjs/toolkit";
import { informationSlice } from "./slice/InformationSlice";
import { scramblingSlice } from "./slice/ScramblingSlice";
import { wcifSlice } from "./slice/WcifSlice";
import { eventDataSlice } from "./slice/EventDataSlice";
import { settingsSlice } from "./slice/SettingsSlice";

export const createStore = () =>
    configureStore({
        reducer: {
            informationSlice: informationSlice.reducer,
            scramblingSlice: scramblingSlice.reducer,
            wcifSlice: wcifSlice.reducer,
            eventDataSlice: eventDataSlice.reducer,
            settingsSlice: settingsSlice.reducer,
        },
    });

export type AppStore = ReturnType<typeof createStore>;

const store = createStore();

export default store;

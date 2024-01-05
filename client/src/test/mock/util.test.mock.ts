import { configureStore } from "@reduxjs/toolkit";
import { informationSlice } from "../../main/redux/slice/InformationSlice";
import { scramblingSlice } from "../../main/redux/slice/ScramblingSlice";
import { wcifSlice } from "../../main/redux/slice/WcifSlice";
import { AxiosHeaders } from "axios";
import { eventDataSlice } from "../../main/redux/slice/EventDataSlice";
import { settingsSlice } from "../../main/redux/slice/SettingsSlice";

export const axiosResponse = {
    status: 200,
    statusText: "OK",
    headers: {},
    config: {
        headers: new AxiosHeaders(),
    },
};

export const getNewStore = () =>
    configureStore({
        reducer: {
            informationSlice: informationSlice.reducer,
            scramblingSlice: scramblingSlice.reducer,
            wcifSlice: wcifSlice.reducer,
            eventDataSlice: eventDataSlice.reducer,
            settingsSlice: settingsSlice.reducer,
        },
    });

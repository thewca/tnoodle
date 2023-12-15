import { configureStore } from "@reduxjs/toolkit";
import { competitionSlice } from "../../main/redux/slice/CompetitionSlice";
import { informationSlice } from "../../main/redux/slice/InformationSlice";
import { scramblingSlice } from "../../main/redux/slice/ScramblingSlice";
import { wcifSlice } from "../../main/redux/slice/WcifSlice";
import { AxiosHeaders } from "axios";
import { eventDataSlice } from "../../main/redux/slice/EventDataSlice";

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
            competitionSlice: competitionSlice.reducer,
            informationSlice: informationSlice.reducer,
            scramblingSlice: scramblingSlice.reducer,
            wcifSlice: wcifSlice.reducer,
            eventDataSlice: eventDataSlice.reducer,
        },
    });

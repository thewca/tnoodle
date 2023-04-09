import { configureStore } from "@reduxjs/toolkit";
import { competitionSlice } from "../../main/redux/slice/CompetitionSlice";
import { fmcSlice } from "../../main/redux/slice/FmcSlice";
import { informationSlice } from "../../main/redux/slice/InformationSlice";
import { mbldSlice } from "../../main/redux/slice/MbldSlice";
import { scramblingSlice } from "../../main/redux/slice/ScramblingSlice";
import { wcifSlice } from "../../main/redux/slice/WcifSlice";
import { AxiosHeaders } from "axios";

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
            fmcSlice: fmcSlice.reducer,
            informationSlice: informationSlice.reducer,
            mbldSlice: mbldSlice.reducer,
            scramblingSlice: scramblingSlice.reducer,
            wcifSlice: wcifSlice.reducer,
        },
    });

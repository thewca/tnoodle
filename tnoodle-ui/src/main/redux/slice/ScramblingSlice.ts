import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScramblingState {
    fileZip?: { contentType: string; payload: string };
    generatingScrambles: boolean;
    officialZipStatus: boolean;
    password: string;
    scramblingProgressCurrent: Record<string, number>;
    scramblingProgressTarget: Record<string, number>;
}

const initialState: ScramblingState = {
    fileZip: undefined,
    generatingScrambles: false,
    password: "",
    officialZipStatus: true,
    scramblingProgressCurrent: {},
    scramblingProgressTarget: {},
};

export const scramblingSlice = createSlice({
    name: "scramblingSlice",
    initialState,
    reducers: {
        setFileZip: (
            state,
            action: PayloadAction<
                { contentType: string; payload: string } | undefined
            >
        ) => {
            state.fileZip = action.payload;
        },
        setGeneratingScrambles: (state, action: PayloadAction<boolean>) => {
            state.generatingScrambles = action.payload;
        },
        setOfficialZipStatus: (state, action: PayloadAction<boolean>) => {
            state.officialZipStatus = action.payload;
        },
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        resetScramblingProgressCurrent: (state) => {
            state.scramblingProgressCurrent = {};
        },
        setScramblingProgressCurrentEvent: (
            state,
            action: PayloadAction<string>
        ) => {
            state.scramblingProgressCurrent[action.payload] =
                (state.scramblingProgressCurrent[action.payload] || 0) + 1;
        },
        setScramblingProgressTarget: (
            state,
            action: PayloadAction<Record<string, number>>
        ) => {
            state.scramblingProgressTarget = action.payload;
        },
    },
});

export const {
    setFileZip,
    setOfficialZipStatus,
    setPassword,
    setGeneratingScrambles,
    resetScramblingProgressCurrent,
    setScramblingProgressCurrentEvent,
    setScramblingProgressTarget,
} = scramblingSlice.actions;

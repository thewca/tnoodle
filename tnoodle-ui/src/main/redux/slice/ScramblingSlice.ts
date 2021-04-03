import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScramblingState {
    fileZipBlob?: Blob;
    generatingScrambles: boolean;
    officialZipStatus: boolean;
    password: string;
    scramblingProgressCurrent: Record<string, number>;
    scramblingProgressTarget: Record<string, number>;
}

const initialState: ScramblingState = {
    fileZipBlob: undefined,
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
        setFileZipBlob: (state, action: PayloadAction<Blob | undefined>) => {
            state.fileZipBlob = action.payload;
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
            action: PayloadAction<{ eventId: string }>
        ) => {
            // Just adapting, but this should be the cause of the strange numbers in scramble generation
            // This just increments no matter what
            state.scramblingProgressCurrent[action.payload.eventId] =
                (state.scramblingProgressCurrent[action.payload.eventId] || 0) +
                1;
        },
        setScramblingProgressTarget: (
            state,
            action: PayloadAction<Record<string, number>>
        ) => {
            state.scramblingProgressCurrent = action.payload;
        },
    },
});

export const {
    setFileZipBlob,
    setOfficialZipStatus,
    setPassword,
    setGeneratingScrambles,
    resetScramblingProgressCurrent,
    setScramblingProgressCurrentEvent,
    setScramblingProgressTarget,
} = scramblingSlice.actions;

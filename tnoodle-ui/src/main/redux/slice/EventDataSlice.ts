import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EventDataState {
    bestMbldAttempt?: number;
    suggestedFmcTranslations?: string[];
}

const initialState: EventDataState = {
    bestMbldAttempt: undefined,
    suggestedFmcTranslations: undefined,
};

export const eventDataSlice = createSlice({
    name: "eventDataSlice",
    initialState,
    reducers: {
        setBestMbldAttempt: (
            state,
            action: PayloadAction<number | undefined>
        ) => {
            state.bestMbldAttempt = action.payload;
        },
        setSuggestedFmcTranslations: (
            state,
            action: PayloadAction<string[] | undefined>
        ) => {
            state.suggestedFmcTranslations = action.payload;
        },
    },
});

export const { setSuggestedFmcTranslations, setBestMbldAttempt } =
    eventDataSlice.actions;

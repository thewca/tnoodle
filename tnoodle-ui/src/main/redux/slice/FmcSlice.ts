import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Translation from "../../model/Translation";

interface FmcState {
    suggestedFmcTranslations?: string[];
    translations?: Translation[];
}

const initialState: FmcState = {
    suggestedFmcTranslations: undefined,
    translations: undefined,
};

export const fmcSlice = createSlice({
    name: "fmcSlice",
    initialState,
    reducers: {
        updateTranslationStatus: (
            state,
            action: PayloadAction<{ id: string; status: boolean }>
        ) => {
            state.translations = state.translations?.map((translation) => ({
                ...translation,
                status:
                    translation.id === action.payload.id
                        ? action.payload.status
                        : translation.status,
            }));
        },
        updateAllTranslationsStatus: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.translations = state.translations?.map((translation) => ({
                ...translation,
                status: action.payload,
            }));
        },
        setSuggestedFmcTranslations: (
            state,
            action: PayloadAction<string[] | undefined>
        ) => {
            state.suggestedFmcTranslations = action.payload;
        },
        setTranslations: (
            state,
            action: PayloadAction<Translation[] | undefined>
        ) => {
            state.translations = action.payload;
        },
    },
});

export const {
    setSuggestedFmcTranslations,
    setTranslations,
    updateTranslationStatus,
    updateAllTranslationsStatus,
} = fmcSlice.actions;

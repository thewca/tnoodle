import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InformationState {
    showColorPicker: boolean;
    isUsingStaging: boolean;
}

const initialState: InformationState = {
    showColorPicker: true,
    isUsingStaging: false,
};

export const settingsSlice = createSlice({
    name: "settingsSlice",
    initialState,
    reducers: {
        setShowColorPicker: (state, action: PayloadAction<boolean>) => {
            state.showColorPicker = action.payload;
        },
        setIsUsingStaging: (state, action: PayloadAction<boolean>) => {
            state.isUsingStaging = action.payload;
        },
    },
});

export const { setShowColorPicker, setIsUsingStaging } = settingsSlice.actions;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MBLD_DEFAULT } from "../../constants/wca.constants";

interface MbldState {
    bestMbldAttempt?: number;
    mbld: string;
}

const initialState: MbldState = {
    bestMbldAttempt: undefined,
    mbld: "" + MBLD_DEFAULT,
};

export const mbldSlice = createSlice({
    name: "mbldSlice",
    initialState,
    reducers: {
        setMbld: (state, action: PayloadAction<string>) => {
            state.mbld = action.payload;
        },
        setBestMbldAttempt: (
            state,
            action: PayloadAction<number | undefined>
        ) => {
            state.bestMbldAttempt = action.payload;
        },
    },
});

export const { setMbld, setBestMbldAttempt } = mbldSlice.actions;

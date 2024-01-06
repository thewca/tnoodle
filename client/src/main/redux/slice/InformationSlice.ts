import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CachedObject from "../../model/CachedObject";

interface InformationState {
    cachedObjects: Record<string, CachedObject>;
    isManualSelection: boolean;
}

const initialState: InformationState = {
    cachedObjects: {},
    isManualSelection: true,
};

export const informationSlice = createSlice({
    name: "informationSlice",
    initialState,
    reducers: {
        setIsManualSelection: (state, action: PayloadAction<boolean>) => {
            state.isManualSelection = action.payload;
        },
        addCachedObject: (
            state,
            action: PayloadAction<{
                competitionId: string;
                identifier: string;
                object: any;
            }>
        ) => {
            state.cachedObjects = {
                ...state.cachedObjects,
                [action.payload.competitionId]: {
                    ...state.cachedObjects[action.payload.competitionId],
                    [action.payload.identifier]: action.payload.object,
                },
            };
        },
    },
});

export const { addCachedObject, setIsManualSelection } =
    informationSlice.actions;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CachedObject from "../../model/CachedObject";
import Person from "../../model/Person";

interface InformationState {
    cachedObjects: Record<string, CachedObject>;
    me?: Person;
}

const initialState: InformationState = {
    cachedObjects: {},
    me: undefined,
};

export const informationSlice = createSlice({
    name: "informationSlice",
    initialState,
    reducers: {
        setMe: (state, action: PayloadAction<Person>) => {
            state.me = action.payload;
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

export const { setMe, addCachedObject } = informationSlice.actions;

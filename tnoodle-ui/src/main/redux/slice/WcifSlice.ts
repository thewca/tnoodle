import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import WcaEvent from "../../model/WcaEvent";
import WcaFormat from "../../model/WcaFormat";
import Wcif from "../../model/Wcif";
import WcifEvent from "../../model/WcifEvent";
import { competitionName2Id } from "../../util/competition.name.util";
import { defaultWcif } from "../../util/wcif.util";

interface WcifState {
    editingStatus: boolean;
    wcaEvents?: WcaEvent[];
    wcaFormats?: Record<string, WcaFormat>;
    wcif: Wcif;
}

const initialState: WcifState = {
    editingStatus: true, // If we fetch competition info, some fields can't be changed
    wcaEvents: undefined,
    wcaFormats: undefined,
    wcif: defaultWcif,
};

export const wcifSlice = createSlice({
    name: "wcifSlice",
    initialState,
    reducers: {
        setEditingStatus: (state, action: PayloadAction<boolean>) => {
            state.editingStatus = action.payload;
        },
        setWcaEvent: (state, action: PayloadAction<WcifEvent>) => {
            state.wcif = {
                ...state.wcif,
                events: [
                    ...state.wcif.events.filter(
                        (wcaEvent) => wcaEvent.id !== action.payload.id
                    ),
                    action.payload,
                ],
            };
        },
        setWcaEvents: (state, action: PayloadAction<WcaEvent[]>) => {
            state.wcaEvents = action.payload;
        },
        setWcaFormats: (
            state,
            action: PayloadAction<Record<string, WcaFormat>>
        ) => {
            state.wcaFormats = action.payload;
        },
        setCompetitionName: (state, action: PayloadAction<string>) => {
            let competitionName = action.payload;
            let id = competitionName2Id(competitionName);
            state.wcif = {
                ...state.wcif,
                name: competitionName,
                shortName: competitionName,
                id,
            };
        },
    },
});

export const {
    setCompetitionName,
    setEditingStatus,
    setWcaEvent,
    setWcaEvents,
    setWcaFormats,
} = wcifSlice.actions;

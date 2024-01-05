import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Competition from "../../model/Competition";

interface CompetitionState {
    competitionId?: string;
    competitions?: Competition[];
}

const initialState: CompetitionState = {
    competitionId: undefined,
    competitions: undefined,
};

export const competitionSlice = createSlice({
    name: "competitionSlice",
    initialState,
    reducers: {
        setCompetitionId: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.competitionId = action.payload;
        },
        setCompetitions: (state, action: PayloadAction<Competition[]>) => {
            state.competitions = action.payload;
        },
    },
});

export const { setCompetitionId, setCompetitions } = competitionSlice.actions;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import WcaEvent from "../../model/WcaEvent";
import WcaFormat from "../../model/WcaFormat";
import Wcif from "../../model/Wcif";
import WcifEvent from "../../model/WcifEvent";
import { competitionName2Id } from "../../util/competition.name.util";
import {
    copiesExtensionId,
    fmcTranslationsExtensionId,
    mbldCubesExtensionId,
    defaultWcif,
    getDefaultCopiesExtension,
} from "../../util/wcif.util";

interface WcifState {
    wcaEvents?: WcaEvent[];
    wcaFormats?: Record<string, WcaFormat>;
    wcif: Wcif;
}

const initialState: WcifState = {
    wcaEvents: undefined,
    wcaFormats: undefined,
    wcif: { ...defaultWcif },
};

export const wcifSlice = createSlice({
    name: "wcifSlice",
    initialState,
    reducers: {
        setCompetitionName: (state, action: PayloadAction<string>) => {
            const competitionName = action.payload;
            const id = competitionName2Id(competitionName);

            state.wcif = {
                ...state.wcif,
                name: competitionName,
                shortName: competitionName,
                id,
            };
        },
        setWcifEvent: (state, action: PayloadAction<WcifEvent>) => {
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
        setWcif: (state, action: PayloadAction<Wcif>) => {
            state.wcif = {
                ...action.payload,
                events: action.payload.events.map((event) => ({
                    ...event,
                    rounds: event.rounds.map((round) => ({
                        ...round,
                        extensions: [
                            ...round.extensions.filter(
                                (it) => it.id !== copiesExtensionId // avoid duplicating extension
                            ),
                            getDefaultCopiesExtension(),
                        ],
                    })),
                    extensions: [
                        ...event.extensions.filter(
                            (it) =>
                                it.id !== fmcTranslationsExtensionId &&
                                it.id !== mbldCubesExtensionId
                        ),
                    ],
                })),
            };
        },
    },
});

export const {
    setCompetitionName,
    setWcifEvent,
    setWcaEvents,
    setWcaFormats,
    setWcif,
} = wcifSlice.actions;

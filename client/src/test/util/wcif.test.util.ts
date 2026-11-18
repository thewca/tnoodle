import type { Wcif } from "../../main/api/wca.redocly.schemas";
import { findExtension } from "../../main/util/extension.util";
import {
    copiesExtensionId,
    fmcTranslationsExtensionId,
    mbldCubesExtensionId,
} from "../../main/util/wcif.util";

const findEvent = (wcif: Wcif, eventId: string) =>
    wcif.events.find((event) => event.id === eventId);

/** Ids of the events that will actually get scrambles. */
export const scrambledEventIds = (wcif: Wcif) =>
    wcif.events
        .filter((event) => event.rounds.length > 0)
        .map((event) => event.id)
        .sort();

export const getRounds = (wcif: Wcif, eventId: string) =>
    findEvent(wcif, eventId)?.rounds ?? [];

export const getCopies = (wcif: Wcif, eventId: string, roundIndex: number) =>
    findExtension(getRounds(wcif, eventId)[roundIndex], copiesExtensionId)?.data
        .numCopies;

export const getMbldCubesCount = (wcif: Wcif) => {
    const mbld = findEvent(wcif, "333mbf");
    return (
        mbld &&
        findExtension(mbld, mbldCubesExtensionId)?.data.requestedScrambles
    );
};

export const getFmcLanguageTags = (wcif: Wcif) => {
    const fmc = findEvent(wcif, "333fm");
    return (
        fmc && findExtension(fmc, fmcTranslationsExtensionId)?.data.languageTags
    );
};

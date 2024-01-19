import Wcif from "../model/Wcif";
import WcifEvent from "../model/WcifEvent";
import { getDefaultCompetitionName } from "./competition.name.util";

export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";
export const colorSchemeExtensionId =
    "org.worldcubeassociation.tnoodle.ColorScheme";
export const frontendStatusExtensionId =
    "org.worldcubeassociation.tnoodle.CompetitionStatus";
export const fmcTranslationsExtensionId =
    "org.worldcubeassociation.tnoodle.FmcLanguages";
export const mbldCubesExtensionId =
    "org.worldcubeassociation.tnoodle.MultiScrambleCount";

/**
 * This is the default extension object the backend expects
 * @param {} copies
 */
export const getDefaultCopiesExtension = () => {
    return {
        id: copiesExtensionId,
        specUrl: "",
        data: {
            numCopies: 1,
        },
    };
};

export const buildMbldExtension = (mbld: number) => {
    return {
        id: mbldCubesExtensionId,
        specUrl: "",
        data: {
            requestedScrambles: mbld
        },
    };
};

// Add 1 round of 3x3x3
let default333: WcifEvent = {
    id: "333",
    rounds: [
        {
            format: "a",
            id: "333-r1",
            scrambleSetCount: 1,
            extensions: [getDefaultCopiesExtension()],
        },
    ],
    extensions: [],
};

let name = getDefaultCompetitionName();
export const defaultWcif: Wcif = {
    formatVersion: "1.0",
    name,
    shortName: name,
    id: "",
    events: [default333],
    persons: [],
    schedule: { numberOfDays: 0, venues: [] },
    extensions: [],
};

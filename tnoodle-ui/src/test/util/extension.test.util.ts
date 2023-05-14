import store from "../../main/redux/Store";
import { findExtension } from "../../main/util/extension.util";
import {
    fmcTranslationsExtensionId,
    mbldCubesExtensionId,
} from "../../main/util/wcif.util";

export const getExtensionFromStore = (
    testStore: typeof store,
    eventId: string,
    extensionId: string
) => {
    let wcifEvent = testStore
        .getState()
        .wcifSlice.wcif.events.find((event) => event.id === eventId);

    if (wcifEvent === undefined) {
        return;
    }

    return findExtension(wcifEvent, extensionId);
};

export const getMbldCubesCount = (testStore: typeof store) =>
    getExtensionFromStore(testStore, "333mbf", mbldCubesExtensionId)!.data
        .requestedScrambles;

export const getFmcLanguageTags = (testStore: typeof store) =>
    getExtensionFromStore(testStore, "333fm", fmcTranslationsExtensionId)!.data
        .languageTags;

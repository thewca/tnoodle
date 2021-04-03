import { AnyAction } from "redux";

const defaultStore = {};

export const Reducer = (store: any, action: AnyAction) => {
    // if (action.type === ActionTypes.UPDATE_EVENTS) {
    //     return {
    //         ...store,
    //         wcif: { ...store.wcif, events: action.payload.events },
    //     };
    // }

    // /**
    //  * Either sets or reset WCIF to default.
    //  */
    // if (action.type === ActionTypes.UPDATE_WCIF) {
    //     let wcif = action.payload.wcif || defaultWcif;

    //     // Sets copies to 1 since it does not come from the website.
    //     wcif.events.forEach((event: WcifEvent) =>
    //         event.rounds.forEach((round) =>
    //             round.extensions.push(getDefaultCopiesExtension())
    //         )
    //     );
    //     return {
    //         ...store,
    //         wcif,
    //     };
    // }

    // if (action.type === ActionTypes.SET_SUGGESTED_FMC_TRANSLATIONS) {
    //     let translations = store.translations?.map((translation) => ({
    //         ...translation,
    //         status: action.payload.suggestedFmcTranslations.includes(
    //             translation.id
    //         ),
    //     }));
    //     return {
    //         ...store,
    //         translations,
    //     };
    // }

    return store || defaultStore;
};

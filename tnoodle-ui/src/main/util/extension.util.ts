import { useEffect } from "react";
import { Extendable, Extension } from "../model/Extension";
import _ from "lodash";
import { ActionCreatorWithPayload, Dispatch, PayloadAction } from "@reduxjs/toolkit";

export const useWriteEffect = <T extends Extendable, Name extends string>(
    extendable: T,
    extensionId: string,
    dispatch: Dispatch<PayloadAction<T, Name>>,
    setExtendable: ActionCreatorWithPayload<T, Name>,
    buildExtension: () => Extension | null,
) => {
    useEffect(() => {
        let newExtension = buildExtension()

        if (newExtension === null) {
            return;
        }

        let oldExtension = extendable.extensions.find((ext) => ext.id === extensionId);
        let extensionDataEqual = _.isEqual(oldExtension?.data, newExtension.data);

        // protect against infinite loops
        if (extensionDataEqual) {
            return;
        }

        let newExtendable = {
            ...extendable,
            extensions: [
                ...extendable.extensions.filter(
                    (it) => it.id !== extensionId
                ),
                newExtension
            ]
        };

        dispatch(setExtendable(newExtendable));
    }, [dispatch, setExtendable, extendable, extensionId, buildExtension]);
}

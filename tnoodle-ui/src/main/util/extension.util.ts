import { Extendable, Extension } from "../model/Extension";
import _ from "lodash";

export const findExtension = <T extends Extendable>(
    extendable: T,
    extensionId: string
) => extendable.extensions.find((ext) => ext.id === extensionId);

export const findAndProcessExtension = <T extends Extendable>(
    extendable: T,
    extensionId: string,
    processExtension: (extension: Extension) => void
) => {
    let extension = findExtension(extendable, extensionId);

    if (extension !== undefined) {
        processExtension(extension);
    }
}

export const removeExtension = <T extends Extendable>(
    extendable: T,
    extensionId: string,
) => {
    return {
        ...extendable,
        extensions: [
            ...extendable.extensions.filter(
                (it) => it.id !== extensionId
            )
        ]
    };
};

export const upsertExtension = <T extends Extendable>(
    extendable: T,
    extension: Extension,
) => {
    let withoutExtension = removeExtension(extendable, extension.id);

    return {
        ...withoutExtension,
        extensions: [
            ...withoutExtension.extensions,
            extension
        ]
    };
}

export const setExtensionLazily = <T extends Extendable>(
    extendable: T,
    extensionId: string,
    buildExtension: () => Extension | null,
    handleOnChange: (newExtendable: T) => void
) => {
    let oldExtension = findExtension(extendable, extensionId);
    let newExtension = buildExtension();

    // null means that we should delete the extension.
    if (newExtension === null) {
        // is there is an extension that we _can_ delete in the first place?
        if (oldExtension !== undefined) {
            let removedExtendable = removeExtension(extendable, extensionId);
            handleOnChange(removedExtendable);
        }
    } else {
        let extensionDataEqual = _.isEqual(oldExtension?.data, newExtension.data);

        // did the extension data update?
        if (!extensionDataEqual) {
            let newExtendable = upsertExtension(extendable, newExtension);
            handleOnChange(newExtendable);
        }
    }
}

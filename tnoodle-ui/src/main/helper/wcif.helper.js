export const copiesExtensionId =
    "org.worldcubeassociation.tnoodle.SheetCopyCount";
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

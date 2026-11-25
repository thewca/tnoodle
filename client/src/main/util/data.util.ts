import type WebsocketBlobResult from "../model/WebsocketBlobResult.ts";

export const convertToBlob = async ({
    contentType,
    payload,
}: WebsocketBlobResult) => {
    const res = await fetch(`data:${contentType};base64,${payload}`);
    return await res.blob();
};

import type Wcif from "../model/Wcif";
import { ScrambleClient } from "./tnoodle.socket";
import type WebsocketBlobResult from "../model/WebsocketBlobResult";

let zipEndpoint = "/wcif/zip";

class TnoodleApi {
    fetchZip = (
        scrambleClient: ScrambleClient,
        wcif: Wcif,
        password: string,
    ) => {
        let payload = {
            wcif,
            zipPassword: !password ? null : password,
        };

        return scrambleClient.loadScrambles(zipEndpoint, payload, wcif.id);
    };

    convertToBlob = async (result: WebsocketBlobResult) => {
        let { contentType, payload } = result;
        let res = await fetch(`data:${contentType};base64,${payload}`);

        return await res.blob();
    };
}

const tnoodleApi = new TnoodleApi();
export default tnoodleApi;

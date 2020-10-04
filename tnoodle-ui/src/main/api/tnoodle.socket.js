import { tNoodleBackend } from "./tnoodle.api";

export class ScrambleClient {
    constructor(onHandshake, onProgress) {
        this.onHandshake = onHandshake;
        this.onProgress = onProgress;

        this.state = SCRAMBLING_STATES.IDLE;

        this.contentType = null;
        this.resultPayload = null;

        this.errorPayload = null;
    }

    loadScrambles(endpoint, payload, targetMarker) {
        return new Promise((resolve, reject) => {
            let ws = new WebSocket(BASE_URL + endpoint);

            ws.onopen = () => {
                this.state = SCRAMBLING_STATES.INITIATE;
                ws.send(JSON.stringify(payload));
            };

            ws.onerror = () => {
                reject(this.errorPayload);
            };

            ws.onclose = (cls) => {
                if (this.state === SCRAMBLING_STATES.DONE && cls.wasClean) {
                    let resultObject = {
                        contentType: this.contentType,
                        payload: this.resultPayload,
                    };

                    resolve(resultObject);
                } else {
                    reject(this.errorPayload);
                }
            };

            ws.onmessage = (msg) => {
                if (this.state === MARKER_ERROR_MESSAGE) {
                    let rawPayload = msg.data.toString();
                    this.errorPayload = JSON.parse(rawPayload);
                }

                if (msg.data === MARKER_ERROR_MESSAGE) {
                    this.state = MARKER_ERROR_MESSAGE; // purposefully go into an error state
                }

                if (this.state === SCRAMBLING_STATES.INITIATE) {
                    this.state = SCRAMBLING_STATES.SCRAMBLING;

                    let rawPayload = msg.data.toString();
                    let targetPayload = JSON.parse(rawPayload);

                    this.onHandshake(targetPayload);
                } else if (this.state === SCRAMBLING_STATES.SCRAMBLING) {
                    if (msg.data === targetMarker) {
                        this.state = SCRAMBLING_STATES.COMPUTED_TYPE;
                    } else {
                        this.onProgress(msg.data);
                    }
                } else if (this.state === SCRAMBLING_STATES.COMPUTED_TYPE) {
                    this.state = SCRAMBLING_STATES.COMPUTED_DATA;

                    this.contentType = msg.data;
                } else if (this.state === SCRAMBLING_STATES.COMPUTED_DATA) {
                    this.state = SCRAMBLING_STATES.DONE;

                    this.resultPayload = msg.data;
                }
            };
        });
    }
}

let wsTNoodleBackend = new URL(tNoodleBackend);
wsTNoodleBackend.protocol = "ws:";

const BASE_URL = wsTNoodleBackend.toString().replace(/\/$/g, "");

const SCRAMBLING_STATES = {
    IDLE: "IDLE",
    INITIATE: "INITIATE",
    SCRAMBLING: "SCRAMBLING",
    COMPUTED_TYPE: "COMPUTED_TYPE",
    COMPUTED_DATA: "COMPUTED_DATA",
    DONE: "DONE",
};

// this has to be identical with backend value in JobSchedulingHandler.kt
const MARKER_ERROR_MESSAGE = "%%ERROR%%";

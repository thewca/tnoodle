import { tNoodleBackend } from "../../paths";
import type WebsocketBlobResult from "../model/WebsocketBlobResult";

export type ScrambleHandshakeFn = (payload: Record<string, number>) => void;
export type ScrambleProgressFn = (payload: string) => void;

const ScramblingState = {
    Idle: 0,
    Initiate: 1,
    Scrambling: 2,
    ComputingType: 3,
    ComputingData: 4,
    Done: 5,
    Error: -1,
};

type ScramblingState = (typeof ScramblingState)[keyof typeof ScramblingState];

export class ScrambleClient {
    onHandshake: ScrambleHandshakeFn;
    onProgress: ScrambleProgressFn;

    state: ScramblingState;

    contentType: string;

    resultPayload: string;
    errorPayload: any;

    constructor(
        onHandshake: ScrambleHandshakeFn,
        onProgress: ScrambleProgressFn,
    ) {
        this.onHandshake = onHandshake;
        this.onProgress = onProgress;

        this.state = ScramblingState.Idle;

        this.contentType = FALLBACK_APPLICATION_TYPE;

        this.resultPayload = "";
        this.errorPayload = null;
    }

    handleReject = (executorReject: (reason?: any) => void, event: Event) => {
        if (this.state === ScramblingState.Error && this.errorPayload) {
            executorReject(this.errorPayload);
        } else {
            executorReject(event);
        }
    };

    loadScrambles(
        payload: object,
        targetMarker: String,
    ): Promise<WebsocketBlobResult> {
        return new Promise((resolve, reject) => {
            let ws = new WebSocket(WEBSOCKET_API + WEBSOCKET_ZIP_ENDPOINT);

            ws.onopen = () => {
                this.state = ScramblingState.Initiate;
                ws.send(JSON.stringify(payload));
            };

            ws.onerror = (err) => {
                this.handleReject(reject, err);
            };

            ws.onclose = (cls) => {
                if (this.state === ScramblingState.Done && cls.wasClean) {
                    let resultObject = {
                        contentType: this.contentType,
                        payload: this.resultPayload,
                    };

                    resolve(resultObject);
                } else {
                    this.handleReject(reject, cls);
                }
            };

            ws.onmessage = (msg) => {
                if (this.state === ScramblingState.Error) {
                    let rawPayload = msg.data.toString();
                    this.errorPayload = JSON.parse(rawPayload);
                }

                if (msg.data === MARKER_ERROR_MESSAGE) {
                    this.state = ScramblingState.Error; // purposefully go into an error state
                }

                if (this.state === ScramblingState.Initiate) {
                    this.state = ScramblingState.Scrambling;

                    let rawPayload = msg.data.toString();
                    let targetPayload = JSON.parse(rawPayload);

                    this.onHandshake(targetPayload);
                } else if (this.state === ScramblingState.Scrambling) {
                    if (msg.data === targetMarker) {
                        this.state = ScramblingState.ComputingType;
                    } else {
                        this.onProgress(msg.data);
                    }
                } else if (this.state === ScramblingState.ComputingType) {
                    this.state = ScramblingState.ComputingData;

                    this.contentType = msg.data;
                } else if (this.state === ScramblingState.ComputingData) {
                    this.state = ScramblingState.Done;

                    this.resultPayload = msg.data;
                }
            };
        });
    }
}

let wsTNoodleBackend = new URL(tNoodleBackend);
wsTNoodleBackend.protocol =
    window.location.protocol === "https:" ? "wss" : "ws";

const FALLBACK_APPLICATION_TYPE = "application/octet-stream";

export const WEBSOCKET_API = wsTNoodleBackend.toString().replace(/\/$/g, "");
export const WEBSOCKET_ZIP_ENDPOINT = "/wcif/zip";

// this has to be identical with backend value in JobSchedulingHandler.kt
const MARKER_ERROR_MESSAGE = "%%ERROR%%";

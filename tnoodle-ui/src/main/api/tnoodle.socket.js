export class ScrambleClient {
    constructor(onHandshake, onProgress) {
        this.onHandshake = onHandshake;
        this.onProgress = onProgress;

        this.state = SCRAMBLING_STATES.IDLE;

        this.contentType = null;
        this.resultPayload = null;
    }

    loadScrambles(endpoint, payload, targetMarker) {
        let that = this;

        return new Promise(function (resolve, reject) {
            let ws = new WebSocket(BASE_URL + endpoint);

            ws.onopen = () => {
                that.state = SCRAMBLING_STATES.INITIATE;
                ws.send(JSON.stringify(payload));
            };

            ws.onerror = (err) => {
                reject(err);
            };

            ws.onclose = (cls) => {
                if (that.state === SCRAMBLING_STATES.DONE && cls.wasClean) {
                    let resultObject = {
                        contentType: that.contentType,
                        payload: that.resultPayload
                    };

                    resolve(resultObject);
                } else {
                    reject(cls);
                }
            };

            ws.onmessage = (msg) => {
                if (that.state === SCRAMBLING_STATES.INITIATE) {
                    that.state = SCRAMBLING_STATES.SCRAMBLING;

                    let rawPayload = msg.data.toString();
                    let targetPayload = JSON.parse(rawPayload);

                    that.onHandshake(targetPayload);
                }

                if (that.state === SCRAMBLING_STATES.SCRAMBLING) {
                    if (msg.data === targetMarker) {
                        that.state = SCRAMBLING_STATES.COMPUTED_TYPE;
                    }

                    that.onProgress(msg.data);
                }

                if (that.state === SCRAMBLING_STATES.COMPUTED_TYPE) {
                    that.state = SCRAMBLING_STATES.COMPUTED_DATA;

                    that.contentType = msg.data;
                }

                if (that.state === SCRAMBLING_STATES.COMPUTED_DATA) {
                    that.state = SCRAMBLING_STATES.DONE;

                    that.resultPayload = msg.data;
                }
            };
        });
    }
}

//const BASE_URL = window.location.origin.replace(/^https?:\/\//,'ws://');
const BASE_URL = "ws://localhost:2014/";

const SCRAMBLING_STATES = {
    IDLE: "IDLE",
    INITIATE: "INITIATE",
    SCRAMBLING: "SCRAMBLING",
    COMPUTED_TYPE: "COMPUTED",
    COMPUTED_DATA: "COMPUTED",
    DONE: "DONE"
};

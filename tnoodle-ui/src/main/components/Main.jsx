import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchZip } from "../api/tnoodle.api";
import { ScrambleClient } from "../api/tnoodle.socket";
import { isUsingStaging } from "../api/wca.api";
import {
    resetScramblingProgressCurrent,
    updateFileZipBlob,
    updateGeneratingScrambles,
    updateScramblingProgressCurrentEvent,
    updateScramblingProgressTarget,
} from "../redux/ActionCreators";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import Interceptor from "./Interceptor";
import "./Main.css";
import VersionInfo from "./VersionInfo";

const Main = () => {
    const [competitionNameFileZip, setCompetitionNameFileZip] = useState("");
    const mbld = useSelector((state) => state.mbld);
    const password = useSelector((state) => state.password);
    const translations = useSelector((state) => state.translations);
    const wcif = useSelector((state) => state.wcif);
    const competitionId = useSelector((state) => state.competitionId);
    const generatingScrambles = useSelector(
        (state) => state.generatingScrambles
    );
    const officialZip = useSelector((state) => state.officialZip);
    const fileZipBlob = useSelector((state) => state.fileZipBlob);

    const interceptorRef = useRef();

    const dispatch = useDispatch();

    const onSubmit = (evt) => {
        evt.preventDefault();

        if (generatingScrambles) {
            return;
        }

        if (!!fileZipBlob) {
            downloadZip();
        } else {
            generateZip();
        }
    };

    const generateZip = () => {
        setCompetitionNameFileZip(wcif.name);

        let scrambleClient = new ScrambleClient(
            updateScramblingProgressTarget,
            updateScramblingProgressCurrentEvent
        );

        fetchZip(scrambleClient, wcif, mbld, password, translations)
            .then((blob) => dispatch(updateFileZipBlob(blob)))
            .catch((err) => interceptorRef.current.updateMessage(err))
            .finally(() => {
                dispatch(updateGeneratingScrambles(false));
                dispatch(resetScramblingProgressCurrent());
            });
        dispatch(updateGeneratingScrambles(true));
    };

    const downloadZip = () => {
        // We use the unofficialZip to stamp .zip in order to prevent delegates / organizers mistakes.
        // If TNoodle version is not official (as per VersionInfo) or if we generate scrambles using
        // a competition from staging, add a [Unofficial]

        let isUnofficialZip =
            !officialZip || (competitionId != null && isUsingStaging());

        let fileName =
            (isUnofficialZip ? "[UNOFFICIAL] " : "") +
            competitionNameFileZip +
            ".zip";

        const link = document.createElement("a");
        link.href = URL.createObjectURL(fileZipBlob);
        link.download = fileName;
        link.target = "_blank";
        link.setAttribute("type", "hidden");

        // This is needed for firefox
        document.body.appendChild(link);

        link.click();
        link.remove();
    };

    const scrambleButton = () => {
        if (generatingScrambles) {
            return (
                <button
                    className="btn btn-primary button-transparent form-control"
                    title="Wait until the process is done"
                    disabled
                >
                    Generating Scrambles
                </button>
            );
        }
        if (!!fileZipBlob) {
            return (
                <button type="submit" className="btn btn-success form-control">
                    Download Scrambles
                </button>
            );
        }

        // At least 1 events must have at least 1 round.
        let disableScrambleButton = !wcif.events
            .map((event) => event.rounds.length > 0)
            .reduce((flag1, flag2) => flag1 || flag2, false);

        // In case the user did not select any events, we make the button a little more transparent than disabled
        let btnClass =
            "btn btn-primary form-control" +
            (disableScrambleButton ? " button-transparent" : "");
        return (
            <button
                type="submit"
                className={btnClass}
                disabled={disableScrambleButton}
                title={disableScrambleButton ? "No events selected." : ""}
            >
                Generate Scrambles
            </button>
        );
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="sticky-top bg-light">
                <Interceptor ref={interceptorRef} />
                <VersionInfo />
                <div className="container-fluid pt-2">
                    <div className="row">
                        <EntryInterface />
                        <div className="col-sm-4 form-group">
                            <label>&nbsp;</label>
                            {scrambleButton()}
                        </div>
                    </div>
                </div>
            </div>
            <EventPickerTable />
        </form>
    );
};

export default Main;

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchRunningVersion } from "../api/tnoodle.api";
import { fetchVersionInfo } from "../api/wca.api";
import CurrentTnoodle from "../model/CurrentTnoodle";
import { setOfficialZipStatus } from "../redux/slice/ScramblingSlice";

const VersionInfo = () => {
    const [currentTnoodle, setCurrentTnoodle] = useState<CurrentTnoodle>();
    const [allowedTnoodleVersions, setAllowedTnoodleVersions] = useState<
        string[]
    >();
    const [runningVersion, setRunningVersion] = useState<string>();
    const [signedBuild, setSignedBuild] = useState<boolean>();
    const [signatureKeyBytes, setSignatureKeyBytes] = useState<string>();
    const [wcaPublicKeyBytes, setWcaPublicKeyBytes] = useState<string>();
    const [signatureValid, setSignatureValid] = useState(true);

    useEffect(
        () =>
            setSignatureValid(
                !!signedBuild && signatureKeyBytes === wcaPublicKeyBytes
            ),
        [signedBuild, signatureKeyBytes, wcaPublicKeyBytes]
    );

    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch from WCA API.
        fetchVersionInfo().then((response) => {
            if (!response) {
                return;
            }
            setCurrentTnoodle(response.current);
            setAllowedTnoodleVersions(response.allowed);
            setWcaPublicKeyBytes(response.publicKeyBytes);
        });

        fetchRunningVersion().then((response) => {
            if (!response) {
                return;
            }

            setRunningVersion(
                !!response.projectName && !!response.projectVersion
                    ? `${response.projectName}-${response.projectVersion}`
                    : ""
            );
            setSignedBuild(response.signedBuild);
            setSignatureKeyBytes(response.signatureKeyBytes);
        });
    }, [dispatch, signatureValid]);

    // This avoids global state update while rendering
    const analyzeVerion = () => {
        // We wait until both wca and tnoodle answers
        if (!allowedTnoodleVersions || !runningVersion) {
            return;
        }

        dispatch(
            setOfficialZipStatus(
                signatureValid &&
                    allowedTnoodleVersions.includes(runningVersion)
            )
        );
    };
    useEffect(analyzeVerion, [
        allowedTnoodleVersions,
        dispatch,
        runningVersion,
        signatureValid,
    ]);

    // We cannot analyze TNoodle version here. We do not bother the user.
    if (!runningVersion || !allowedTnoodleVersions) {
        return null;
    }

    // Running version is not the most recent release
    if (runningVersion !== currentTnoodle?.name) {
        // Running version is allowed, but not the latest.
        if (allowedTnoodleVersions.includes(runningVersion)) {
            return (
                <div className="alert alert-info m-0">
                    You are running {runningVersion}, which is still allowed,
                    but you should upgrade to {currentTnoodle?.name} available{" "}
                    <a href={currentTnoodle?.download}>here</a> as soon as
                    possible.
                </div>
            );
        }

        return (
            <div className="alert alert-danger m-0">
                You are running {runningVersion}, which is not allowed. Do not
                use scrambles generated in any official competition and consider
                downloading the latest version{" "}
                <a href={currentTnoodle?.download}>here</a>.
            </div>
        );
    }

    // Generated version is not an officially signed jar
    if (!signatureValid) {
        return (
            <div className="alert alert-danger m-0">
                You are running an unsigned TNoodle release. Do not use
                scrambles generated in any official competition and consider
                downloading the official program{" "}
                <a href={currentTnoodle.download}>here</a>
            </div>
        );
    }

    return null;
};

export default VersionInfo;

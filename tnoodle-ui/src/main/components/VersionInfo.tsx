import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import wcaApi, { isUsingStaging } from "../api/wca.api";
import CurrentTnoodle from "../model/CurrentTnoodle";
import { setWcif } from "../redux/slice/WcifSlice";
import { frontentStatusExtensionId } from "../util/wcif.util";
import RootState from "../model/RootState";
import { useWriteEffect } from "../util/extension.util";

const VersionInfo = () => {
    const wcif = useSelector(
        (state: RootState) => state.wcifSlice.wcif
    );
    const competitionId = useSelector(
        (state: RootState) => state.competitionSlice.competitionId
    );

    // WCA API response
    const [currentTnoodle, setCurrentTnoodle] = useState<CurrentTnoodle>();
    const [allowedTnoodleVersions, setAllowedTnoodleVersions] = useState<string[]>();
    const [wcaPublicKeyBytes, setWcaPublicKeyBytes] = useState<string>();

    // TNoodle backend API response
    const [runningVersion, setRunningVersion] = useState<string>();
    const [signedBuild, setSignedBuild] = useState<boolean>();
    const [signatureKeyBytes, setSignatureKeyBytes] = useState<string>();

    // what we make of it
    const [signatureValid, setSignatureValid] = useState<boolean>(false);
    const [versionAllowed, setVersionAllowed] = useState<boolean>(false);

    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch from WCA API.
        wcaApi.fetchVersionInfo().then((response) => {
            setCurrentTnoodle(response.data.current);
            setAllowedTnoodleVersions(response.data.allowed);
            setWcaPublicKeyBytes(response.data.publicKeyBytes);
        });

        tnoodleApi.fetchRunningVersion().then((response) => {
            let versionString = !!response.data.projectName && !!response.data.projectVersion
                ? `${response.data.projectName}-${response.data.projectVersion}`
                : "";

            setRunningVersion(versionString);
            setSignedBuild(response.data.signedBuild);
            setSignatureKeyBytes(response.data.signatureKeyBytes);
        });
    }, [dispatch]);

    useEffect(() => {
        if (signedBuild === undefined || signatureKeyBytes === undefined || wcaPublicKeyBytes === undefined) {
            return;
        }

        setSignatureValid(
            signedBuild && signatureKeyBytes === wcaPublicKeyBytes
        );
    }, [signedBuild, signatureKeyBytes, wcaPublicKeyBytes]);

    useEffect(() => {
        if (allowedTnoodleVersions === undefined || runningVersion === undefined) {
            return;
        }

        setVersionAllowed(
            allowedTnoodleVersions.includes(runningVersion)
        );
    }, [allowedTnoodleVersions, runningVersion]);

    const buildFrontendStatusExtension = useCallback(
        () => {
            return {
                id: frontentStatusExtensionId,
                specUrl: "",
                data: {
                    isStaging: isUsingStaging(),
                    isManual: competitionId == null,
                    isSignedBuild: signatureValid,
                    isAllowedVersion: versionAllowed
                }
            };
        }, [competitionId, signatureValid, versionAllowed]
    );

    useWriteEffect(
        wcif,
        frontentStatusExtensionId,
        dispatch,
        setWcif,
        buildFrontendStatusExtension
    );

    // We cannot analyze TNoodle version here. We do not bother the user.
    if (!runningVersion || !allowedTnoodleVersions || !currentTnoodle) {
        return null;
    }

    // Running version is not the most recent release
    if (runningVersion !== currentTnoodle.name) {
        // Running version is allowed, but not the latest.
        if (versionAllowed) {
            return (
                <div className="alert alert-info m-0">
                    You are running {runningVersion}, which is still allowed,
                    but you should upgrade to {currentTnoodle.name} available{" "}
                    <a href={currentTnoodle.download}>here</a> as soon as
                    possible.
                </div>
            );
        }

        return (
            <div className="alert alert-danger m-0">
                You are running {runningVersion}, which is not allowed. Do not
                use scrambles generated in any official competition and consider
                downloading the latest version{" "}
                <a href={currentTnoodle.download}>here</a>.
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

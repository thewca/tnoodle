import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { client as wcaClient } from "../api/wca";
import { client as tnoodleClient } from "../api/tnoodle";
import type { ScrambleProgramVersion } from "../api/wca.schemas";
import { setWcif } from "../redux/slice/WcifSlice";
import { frontendStatusExtensionId } from "../util/wcif.util";
import type RootState from "../model/RootState";
import { setExtensionLazily } from "../util/extension.util";
import { isUsingStaging } from "../api/wca.oidc";

const VersionInfo = () => {
    const wcif = useSelector((state: RootState) => state.wcifSlice.wcif);
    const isManualSelection = useSelector(
        (state: RootState) => state.informationSlice.isManualSelection,
    );

    // WCA API response
    const [currentTnoodle, setCurrentTnoodle] = useState<ScrambleProgramVersion>();
    const [allowedTnoodleVersions, setAllowedTnoodleVersions] =
        useState<string[]>();
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
        wcaClient.getScrambleProgram().then((response) => {
            setCurrentTnoodle(response.current);
            setAllowedTnoodleVersions(response.allowed);
            setWcaPublicKeyBytes(response.publicKeyBytes);
        });

        tnoodleClient.getVersionInfo().then((response) => {
            let versionString =
                !!response.project_name && !!response.project_version
                    ? `${response.project_name}-${response.project_version}`
                    : "";

            setRunningVersion(versionString);
            setSignedBuild(response.is_signed_build);
            setSignatureKeyBytes(response.signature_key_bytes);
        });
    }, []);

    useEffect(() => {
        if (
            signedBuild === undefined ||
            signatureKeyBytes === undefined ||
            wcaPublicKeyBytes === undefined
        ) {
            return;
        }

        setSignatureValid(
            signedBuild && signatureKeyBytes === wcaPublicKeyBytes,
        );
    }, [signedBuild, signatureKeyBytes, wcaPublicKeyBytes]);

    useEffect(() => {
        if (
            allowedTnoodleVersions === undefined ||
            runningVersion === undefined
        ) {
            return;
        }

        setVersionAllowed(allowedTnoodleVersions.includes(runningVersion));
    }, [allowedTnoodleVersions, runningVersion]);

    const buildFrontendStatusExtension = useCallback(() => {
        return {
            id: frontendStatusExtensionId,
            specUrl: "",
            data: {
                isStaging: isUsingStaging(),
                isManual: isManualSelection,
                isSignedBuild: signatureValid,
                isAllowedVersion: versionAllowed,
            },
        };
    }, [isManualSelection, signatureValid, versionAllowed]);

    useEffect(() => {
        setExtensionLazily(
            wcif,
            frontendStatusExtensionId,
            buildFrontendStatusExtension,
            (wcif) => dispatch(setWcif(wcif)),
        );
    }, [dispatch, wcif, buildFrontendStatusExtension]);

    // We cannot analyze TNoodle version here. We do not bother the user.
    if (!runningVersion || !allowedTnoodleVersions || !currentTnoodle) {
        return null;
    }

    // Running version is not the most recent release
    if (runningVersion !== currentTnoodle.name) {
        // Running version is allowed, but not the latest.
        if (versionAllowed) {
            return (
                <div className="alert alert-info m-0" role="alert">
                    You are running {runningVersion}, which is still allowed,
                    but you should upgrade to {currentTnoodle.name} available{" "}
                    <a href={currentTnoodle.download}>here</a> as soon as
                    possible.
                </div>
            );
        }

        return (
            <div className="alert alert-danger m-0" role="alert">
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
            <div className="alert alert-danger m-0" role="alert">
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

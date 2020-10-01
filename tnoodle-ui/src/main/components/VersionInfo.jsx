import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchRunningVersion } from "../api/tnoodle.api";
import { fetchVersionInfo } from "../api/wca.api";
import { updateOfficialZipStatus } from "../redux/ActionCreators";

const mapDispatchToProps = {
    updateOfficialZipStatus,
};

const VersionInfo = connect(
    null,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                currentTnoodle: null,
                allowedTnoodleVersions: null,
                runningVersion: null,
                signedBuild: null,
                signatureKeyBytes: null,
                wcaPublicKeyBytes: null,
                wcaResponse: false,
                tnoodleResponse: false,
            };
        }

        componentDidMount() {
            // Fetch from WCA API.
            fetchVersionInfo().then((response) => {
                if (!response) {
                    return;
                }
                let {current, allowed, publicKeyBytes} = response;
                this.setState({
                    ...this.state,
                    currentTnoodle: current,
                    allowedTnoodleVersions: allowed,
                    wcaPublicKeyBytes: publicKeyBytes,
                    wcaResponse: true,
                });
                this.analyzeVersion();
            });

            fetchRunningVersion().then((response) => {
                if (!response) {
                    return;
                }
                let {projectName, projectVersion, signedBuild, signatureKeyBytes} = response;
                this.setState({
                    ...this.state,
                    // Running version is based on projectName and projectVersion
                    runningVersion:
                        projectName != null && projectVersion != null
                            ? `${projectName}-${projectVersion}`
                            : "",
                    signedBuild: signedBuild,
                    signatureKeyBytes: signatureKeyBytes,
                    tnoodleResponse: true,
                });
                this.analyzeVersion();
            });
        }

        signatureValid() {
            return this.state.signedBuild && this.state.signatureKeyBytes === this.state.wcaPublicKeyBytes;
        }

        // This method avoids global state update while rendering
        analyzeVersion() {
            // We wait until both wca and tnoodle answers
            if (!this.state.tnoodleResponse || !this.state.wcaResponse) {
                return;
            }

            let runningVersion = this.state.runningVersion;
            let allowedVersions = this.state.allowedTnoodleVersions;
            let signedBuild = this.signatureValid();

            if (!signedBuild || !allowedVersions.includes(runningVersion)) {
                this.props.updateOfficialZipStatus(false);
            }
        }

        render() {
            let runningVersion = this.state.runningVersion;
            let allowedVersions = this.state.allowedTnoodleVersions;
            let currentTnoodle = this.state.currentTnoodle;
            let signedBuild = this.signatureValid();

            // We cannot analyze TNoodle version here. We do not bother the user.
            if (!runningVersion || !allowedVersions) {
                return null;
            }

            // Running version is not the most recent release
            if (runningVersion !== currentTnoodle.name) {
                // Running version is allowed, but not the latest.
                if (allowedVersions.includes(runningVersion)) {
                    return (
                        <div className="alert alert-info m-0">
                            You are running {runningVersion}, which is still
                            allowed, but you should upgrade to {currentTnoodle.name}{" "}
                            available <a href={currentTnoodle.download}>here</a>{" "}
                            as soon as possible.
                        </div>
                    );
                }

                return (
                    <div className="alert alert-danger m-0">
                        You are running {runningVersion}, which is not allowed.
                        Do not use scrambles generated in any official competition
                        and consider downloading the latest version{" "}
                        <a href={currentTnoodle.download}>here</a>.
                    </div>
                );
            }

            // Generated version is not an officially signed jar
            if (!signedBuild) {
                return (
                    <div className="alert alert-danger m-0">
                        You are running an unsigned TNoodle release.
                        Do not use scrambles generated in any official competition
                        and consider downloading the official program{" "}
                        <a href={currentTnoodle.download}>here</a>
                    </div>
                );
            }

            return null;
        }
    }
);

export default VersionInfo;

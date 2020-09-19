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
                officialBuild: null,
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
                this.setState({
                    ...this.state,
                    currentTnoodle: response.current,
                    allowedTnoodleVersions: response.allowed,
                    wcaResponse: true,
                });
                this.analizeVersion();
            });

            fetchRunningVersion().then((response) => {
                if (!response) {
                    return;
                }
                let { projectName, projectVersion, signedBuild } = response;
                this.setState({
                    ...this.state,
                    // Running version is based on projectName and projectVersion
                    runningVersion:
                        projectVersion != null && projectVersion != null
                            ? `${projectName}-${projectVersion}`
                            : "",
                    officialBuild: signedBuild,
                    tnoodleResponse: true,
                });
                this.analizeVersion();
            });
        }

        // This method avoids global state update while rendering
        analizeVersion() {
            // We wait until both wca and tnoodle answes
            if (!this.state.tnoodleResponse || !this.state.wcaResponse) {
                return;
            }

            let runningVersion = this.state.runningVersion;
            let allowedVersions = this.state.allowedTnoodleVersions;
            let officialBuild = this.state.officialBuild;

            if (!officialBuild || !allowedVersions.includes(runningVersion)) {
                this.props.updateOfficialZipStatus(false);
            }
        }

        render() {
            let runningVersion = this.state.runningVersion;
            let allowedVersions = this.state.allowedTnoodleVersions;
            let currentTnoodle = this.state.currentTnoodle;
            let officialBuild = this.state.officialBuild;

            // We cannot analyze TNoodle version here. We do not bother the user.
            if (!runningVersion || !allowedVersions) {
                return null;
            }

            // Generated version is not an official jar
            if (!officialBuild) {
                return (
                    <div className="alert alert-danger m-0">
                        This TNoodle version is not official and scrambles
                        generated with this must not be used in competition. You
                        are on version {runningVersion}, you should use{" "}
                        {currentTnoodle.name} available{" "}
                        <a href={currentTnoodle.download}>here</a>
                    </div>
                );
            }

            // Best case scenario. We place this after the officialBuild
            // so we can avoid not official build from being accidentally used.
            if (runningVersion === currentTnoodle.name) {
                return null;
            }

            // Running version is not allowed anymore.
            if (!allowedVersions.includes(runningVersion)) {
                return (
                    <div className="alert alert-danger m-0">
                        This TNoodle version is not allowed. Do not use
                        scrambles generated in any official competition and
                        consider downloading the latest version{" "}
                        <a href={this.state.currentTnoodle.download}>here</a>.
                    </div>
                );
            }

            // Running version is allowed, but not the latest.
            if (
                allowedVersions.includes(runningVersion) &&
                runningVersion !== currentTnoodle.name
            ) {
                return (
                    <div className="alert alert-info m-0">
                        You are running {runningVersion}, which is still
                        allowed, but you should upgrade to {currentTnoodle.name}{" "}
                        available <a href={currentTnoodle.download}>here</a>.
                    </div>
                );
            }

            return null;
        }
    }
);

export default VersionInfo;

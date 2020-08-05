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
            };
        }

        componentDidMount() {
            // Fetch from WCA API.
            fetchVersionInfo()
                .then((response) => {
                    this.setState({
                        ...this.state,
                        currentTnoodle: response.current,
                        allowedTnoodleVersions: response.allowed,
                    });
                })
                .catch((e) => console.error(e));

            fetchRunningVersion()
                .then((response) => response.json())
                .then((version) => {
                    let { runningVersion, officialBuild } = version;
                    this.setState({
                        ...this.state,
                        runningVersion,
                        officialBuild,
                    });
                })
                .catch((e) => console.error(e));
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

            // Best case scenario
            if (runningVersion === currentTnoodle.name) {
                return null;
            }

            // Generated version is not an official jar
            if (officialBuild) {
                this.props.updateOfficialZipStatus(false);
                return (
                    <div className="alert alert-danger">
                        This TNoodle version is not official and scrambles
                        generated with this must not be used in competition. You
                        are on version {runningVersion}, you should use{" "}
                        {currentTnoodle.name} available{" "}
                        <a href={currentTnoodle.download}>here</a>
                    </div>
                );
            }

            // Running version is not allowed anymore.
            if (!allowedVersions.includes(runningVersion)) {
                this.props.updateOfficialZipStatus(false);
                return (
                    <div className="alert alert-danger">
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
                    <div className="alert alert-info">
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

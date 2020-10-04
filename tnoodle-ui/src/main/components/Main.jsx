import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import Interceptor from "./Interceptor";
import VersionInfo from "./VersionInfo";
import { fetchZip } from "../api/tnoodle.api";
import { ScrambleClient } from "../api/tnoodle.socket";
import {
    updateFileZipBlob,
    updateGeneratingScrambles,
    updateScramblingProgressTarget,
    updateScramblingProgressCurrentEvent,
    resetScramblingProgressCurrent,
} from "../redux/ActionCreators";
import { connect } from "react-redux";
import { isUsingStaging } from "../api/wca.api";
import "./Main.css";

const mapStateToProps = (store) => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password,
    competitionId: store.competitionId,
    officialZip: store.officialZip,
    fileZipBlob: store.fileZipBlob,
    translations: store.translations,
    generatingScrambles: store.generatingScrambles,
});

const mapDispatchToProps = {
    updateFileZipBlob,
    updateGeneratingScrambles,
    updateScramblingProgressTarget,
    updateScramblingProgressCurrentEvent,
    resetScramblingProgressCurrent,
};

const Main = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.state = {
                competitionNameFileZip: "",
            };

            this.interceptor = React.createRef();
        }
        onSubmit = (evt) => {
            evt.preventDefault();

            if (this.props.generatingScrambles) {
                return;
            }

            if (this.props.fileZipBlob != null) {
                this.downloadZip();
            } else {
                this.generateZip();
            }
        };

        generateZip = () => {
            // If user navigates during generation proccess, we still get the correct name
            this.setState({
                ...this.state,
                competitionNameFileZip: this.props.wcif.name,
            });
            let scrambleClient = new ScrambleClient(
                this.props.updateScramblingProgressTarget,
                this.props.updateScramblingProgressCurrentEvent
            );
            fetchZip(
                scrambleClient,
                this.props.wcif,
                this.props.mbld,
                this.props.password,
                this.props.translations
            )
                .then((blob) => {
                    this.props.updateFileZipBlob(blob);
                })
                .catch((err) => {
                    this.interceptor.current.updateMessage(err);
                })
                .finally(() => {
                    this.props.updateGeneratingScrambles(false);
                    this.props.resetScramblingProgressCurrent();
                });
            this.props.updateGeneratingScrambles(true);
        };

        downloadZip = () => {
            // We use the unofficialZip to stamp .zip in order to prevent delegates / organizers mistakes.
            // If TNoodle version is not official (as per VersionInfo) or if we generate scrambles using
            // a competition from staging, add a [Unofficial]

            let isUnofficialZip =
                !this.props.officialZip ||
                (this.props.competitionId != null && isUsingStaging());

            let fileName =
                (isUnofficialZip ? "[UNOFFICIAL] " : "") +
                this.state.competitionNameFileZip +
                ".zip";

            const link = document.createElement("a");
            link.href = URL.createObjectURL(this.props.fileZipBlob);
            link.download = fileName;
            link.target = "_blank";
            link.setAttribute("type", "hidden");

            // This is needed for firefox
            document.body.appendChild(link);

            link.click();
            link.remove();
        };

        scrambleButton = () => {
            if (this.props.generatingScrambles) {
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
            if (this.props.fileZipBlob != null) {
                return (
                    <button
                        type="submit"
                        className="btn btn-success form-control"
                    >
                        Download Scrambles
                    </button>
                );
            }

            // At least 1 events must have at least 1 round.
            let disableScrambleButton = !this.props.wcif.events
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

        render() {
            return (
                <form onSubmit={this.onSubmit}>
                    <div className="sticky-top bg-light">
                        <Interceptor ref={this.interceptor} />
                        <VersionInfo />
                        <div className="container-fluid pt-2">
                            <div className="row">
                                <EntryInterface />
                                <div className="col-sm-4 form-group">
                                    <label>&nbsp;</label>
                                    {this.scrambleButton()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <EventPickerTable />
                </form>
            );
        }
    }
);

export default Main;

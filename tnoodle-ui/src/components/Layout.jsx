import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import { fetchZip } from "../api/tnoodle.api";
import { updateFileZipBlob } from "../redux/ActionCreators";
import { connect } from "react-redux";
import { isUsingStaging } from "../api/wca.api";

const mapStateToProps = (store) => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password,
    competitionId: store.competitionId,
    officialZip: store.officialZip,
    fileZipBlob: store.fileZipBlob,
});

const mapDispatchToProps = {
    updateFileZipBlob,
};

const Layout = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.state = { generatingScrambles: false };
        }
        onSubmit = (evt) => {
            console.log("Submit");
            evt.preventDefault();

            if (this.state.generatingScrambles) {
                return;
            }

            if (this.props.fileZipBlob != null) {
                this.downloadZip();
            } else {
                this.generateZip();
            }
        };

        setGeneratingScrambles = (flag) => {
            this.setState({ ...this.state, generatingScrambles: flag });
        };

        generateZip = () => {
            // If user navigates during generation proccess, we still get the correct name
            this.setState({
                ...this.state,
                competitionNameFileZip: this.props.wcif.name,
                generatingScrambles: true,
            });
            fetchZip(
                this.props.wcif,
                this.props.mbld,
                this.props.password,
                this.props.translations
            )
                .then((response) => {
                    this.setGeneratingScrambles(false);
                    if (response.ok) {
                        return response.blob();
                    }
                })
                .then((blob) => this.props.updateFileZipBlob(blob));
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

        render() {
            return (
                <form onSubmit={this.onSubmit}>
                    <EntryInterface />
                    <EventPickerTable />
                </form>
            );
        }
    }
);

export default Layout;

import React, { Component } from "react";
import EntryInterface from "./EntryInterface";
import EventPickerTable from "./EventPickerTable";
import {
    fetchZip,
    fetchAvailableFmcTranslations,
    fetchFormats,
    fetchWcaEvents,
} from "../api/tnoodle.api";
import {
    updateFileZipBlob,
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
} from "../redux/ActionCreators";
import { connect } from "react-redux";

const mapStateToProps = (store) => ({
    wcif: store.wcif,
    mbld: store.mbld,
    password: store.password,
    editingDisabled: store.editingDisabled,
    competitionId: store.competitionId,
    officialZip: store.officialZip,
    fileZipBlob: store.fileZipBlob,
    translations: store.translations,
    wcaEvents: store.wcaEvents,
});

const mapDispatchToProps = {
    updateFileZipBlob,
    updateTranslations,
    setWcaFormats,
    setWcaEvents,
};

const Layout = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        onSubmit = (evt) => {
            console.log("Submit");
            evt.preventDefault();
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

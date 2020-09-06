import React, { Component } from "react";
import { connect } from "react-redux";
import { capitalize } from "../util/string.util";
import _ from "lodash";
import {
    updateFileZipBlob,
    updateTranslation,
    selectAllTranslations,
    resetTranslations,
    setSuggestedFmcTranslations,
} from "../redux/ActionCreators";

const TRANSLATIONS_PER_LINE = 3;

const mapStateToProps = (store) => ({
    translations: store.translations,
    suggestedFmcTranslations: store.suggestedFmcTranslations,
});

const mapDispatchToProps = {
    updateFileZipBlob,
    updateTranslation,
    selectAllTranslations,
    resetTranslations,
    setSuggestedFmcTranslations,
};

const FmcTranslationsDetail = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = { showTranslations: false };
        }

        handleTranslation = (id, status) => {
            this.props.updateFileZipBlob(null);
            this.props.updateTranslation(id, status);
        };

        selectAllTranslations = () => {
            this.props.updateFileZipBlob(null);
            this.props.selectAllTranslations();
        };

        selectNoneTranslation = () => {
            this.props.updateFileZipBlob(null);
            this.props.resetTranslations();
        };

        selectSuggestedTranslations = () => {
            this.props.updateFileZipBlob(null);
            this.props.setSuggestedFmcTranslations(
                this.props.suggestedFmcTranslations
            );
        };

        toggleTranslations = () => {
            this.setState({
                ...this.state,
                showTranslations: !this.state.showTranslations,
            });
        };

        maybeShowFmcTranslationsDetails = () => {
            if (
                !this.state.showTranslations ||
                this.props.translations == null
            ) {
                return;
            }
            let translations = _.chunk(
                this.props.translations,
                TRANSLATIONS_PER_LINE
            );

            return (
                <React.Fragment>
                    <tr>
                        <th colSpan={4}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={this.selectAllTranslations}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={this.selectNoneTranslation}
                            >
                                Select None
                            </button>
                            {this.props.suggestedFmcTranslations != null && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={this.selectSuggestedTranslations}
                                    title="This selection is based on competitor's nationalities."
                                >
                                    Select Suggested
                                </button>
                            )}
                        </th>
                    </tr>

                    <tr>
                        <th colSpan={4} className="text-center">
                            <table className="table table-hover">
                                <tbody>
                                    {translations.map(
                                        (translationsChunk, i) => (
                                            <tr key={i}>
                                                {translationsChunk.map(
                                                    (translation, j) => {
                                                        let checkboxId = `fmc-${translation.id}`;
                                                        return (
                                                            <React.Fragment
                                                                key={j}
                                                            >
                                                                <th>
                                                                    <label
                                                                        htmlFor={
                                                                            checkboxId
                                                                        }
                                                                    >
                                                                        {capitalize(
                                                                            translation.display
                                                                        )}
                                                                    </label>
                                                                </th>
                                                                <th>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={
                                                                            checkboxId
                                                                        }
                                                                        checked={
                                                                            translation.status
                                                                        }
                                                                        onChange={(e) =>
                                                                            this.handleTranslation(
                                                                                translation.id, e.target.checked
                                                                            )
                                                                        }
                                                                    />
                                                                </th>
                                                                {j <
                                                                    TRANSLATIONS_PER_LINE -
                                                                    1 && (
                                                                        <th />
                                                                    )}
                                                            </React.Fragment>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </th>
                    </tr>
                </React.Fragment>
            );
        };

        render() {
            if (this.props.translations == null) {
                return null;
            }
            return (
                <tfoot>
                    <tr>
                        <th colSpan={4} className="text-center">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={this.toggleTranslations}
                            >
                                Translations
                            </button>
                        </th>
                    </tr>
                    {this.maybeShowFmcTranslationsDetails()}
                </tfoot>
            );
        }
    }
);

export default FmcTranslationsDetail;

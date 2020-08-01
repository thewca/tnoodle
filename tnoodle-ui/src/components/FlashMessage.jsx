import React, { Component } from "react";
import { connect } from "react-redux";
import { updateFlashMessage } from "../redux/ActionCreators";

const mapStateToProps = (store) => ({
    flashMessage: store.flashMessage,
});

const mapDispatchToProps = {
    updateFlashMessage,
};

const messageDuration = 10; // seconds

const FlashMessage = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        render() {
            let text = this.props.flashMessage.text || this.props.errorMessage;
            let bg = this.props.flashMessage.bootstrapBackground || "danger";
            if (!text) {
                return null;
            }

            // Clear the message after some seconds
            setTimeout(() => {
                this.props.updateFlashMessage("", "");
            }, 1000 * messageDuration);

            return (
                <div className="row sticky-top">
                    <div className={`col-12 alert alert-${bg}`}>{text}</div>
                </div>
            );
        }
    }
);

export default FlashMessage;

import React, { Component } from "react";
import { connect } from "react-redux";
import { updateFlashMessage } from "../redux/ActionCreators";

const mapStateToProps = (store) => ({
    flashMessage: store.flashMessage,
});

const mapDispatchToProps = {
    updateFlashMessage,
};

const FlashMessage = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        render() {
            let text = this.props.flashMessage.text;
            let bg = this.props.flashMessage.bootstrapBackground;
            if (!text || !bg) {
                return null;
            }

            // Clear the message after 5 seconds
            setTimeout(() => {
                this.props.updateFlashMessage("", "");
            }, 5 * 1000);

            return (
                <div className="row sticky-top">
                    <div className={`col-12 bg-${bg}`}>{text}</div>
                </div>
            );
        }
    }
);

export default FlashMessage;

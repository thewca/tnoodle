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
            return (
                <div className="row">
                    <div
                        className={`col-12 bg-${this.props.flashMessage.bootstrapBackground}`}
                    >
                        {this.props.flashMessage.text}
                    </div>
                </div>
            );
        }
    }
);

export default FlashMessage;

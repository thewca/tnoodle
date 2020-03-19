import React, { Component } from "react";
import { connect } from "react-redux";
import { MBLD_MIN } from "../constants/wca.constants";
import { updateMbld, updateFileZipBlob } from "../redux/ActionCreators";

const mapStateToProps = store => ({
    mbld: store.mbld,
    bestMbldAttempt: store.bestMbldAttempt
});

const mapDispatchToProps = {
    updateMbld,
    updateFileZipBlob
};

const MbldDetail = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        handleMbldChange = mbld => {
            this.props.updateMbld(mbld);
        };

        // When mbld loses focus
        verifyMbld = () => {
            let mbld = this.props.mbld;
            if (mbld < MBLD_MIN) {
                mbld = MBLD_MIN;
                this.handleMbldChange(mbld);
            }
        };

        showMbldWarning = () => {
            let bestMbldAttempt = this.props.bestMbldAttempt;
            let showMbldWarning =
                bestMbldAttempt != null && this.props.mbld < bestMbldAttempt;

            if (showMbldWarning) {
                return (
                    <tr className="bg-warning">
                        <th colSpan={4}>
                            {`You selected ${this.props.mbld} cubes for Multi-Blind, but there's a competitor who already tried ${this.props.bestMbldAttempt} at a competition. Proceed if you are really certain of it.`}
                        </th>
                    </tr>
                );
            }
        };

        render() {
            return (
                <tfoot>
                    <tr>
                        <th colSpan={3}>
                            <p className="text-right">
                                Select the number of scrambles
                            </p>
                        </th>
                        <td>
                            <input
                                className="form-control bg-dark text-white"
                                type="number"
                                value={this.props.mbld}
                                onChange={evt =>
                                    this.handleMbldChange(
                                        Number(evt.target.value)
                                    )
                                }
                                min={MBLD_MIN}
                                onBlur={this.verifyMbld}
                            />
                        </td>
                    </tr>
                    {this.showMbldWarning()}
                </tfoot>
            );
        }
    }
);

export default MbldDetail;

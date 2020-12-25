import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { MBLD_MIN } from "../constants/wca.constants";
import { updateMbld, updateFileZipBlob } from "../redux/ActionCreators";

const MbldDetail = () => {
    const mbld = useSelector((state) => state.mbld);
    const bestMbldAttempt = useSelector((state) => state.bestMbldAttempt);
    const generatingScrambles = useSelector(
        (state) => state.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleMbldChange = (evt) => {
        dispatch(updateMbld(evt.target.value));
        dispatch(updateFileZipBlob(null));
    };

    return (
        <tfoot>
            <tr>
                <th colSpan={3}>
                    <p className="text-right">Select the number of scrambles</p>
                </th>
                <td>
                    <input
                        className="form-control bg-dark text-white"
                        type="number"
                        value={mbld}
                        onChange={handleMbldChange}
                        min={MBLD_MIN}
                        required
                        disabled={generatingScrambles}
                    />
                </td>
            </tr>
            {mbld < bestMbldAttempt && (
                <tr className="alert alert-warning">
                    <th colSpan={4}>
                        {`You selected ${mbld} cubes for Multi-Blind, but there's a competitor who already tried ${bestMbldAttempt} at a competition. Proceed if you are really certain of it.`}
                    </th>
                </tr>
            )}
        </tfoot>
    );
};

export default MbldDetail;

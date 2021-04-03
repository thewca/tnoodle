import { useDispatch, useSelector } from "react-redux";
import { MBLD_MIN } from "../constants/wca.constants";
import RootState from "../model/RootState";
import { setMbld } from "../redux/slice/MbldSlice";
import { setFileZipBlob } from "../redux/slice/ScramblingSlice";

const MbldDetail = () => {
    const mbld = useSelector((state: RootState) => state.mbldSlice.mbld);
    const bestMbldAttempt = useSelector(
        (state: RootState) => state.mbldSlice.bestMbldAttempt
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleMbldChange = (newMbld: string) => {
        dispatch(setMbld(newMbld));
        dispatch(setFileZipBlob());
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
                        onChange={(e) => handleMbldChange(e.target.value)}
                        min={MBLD_MIN}
                        required
                        disabled={generatingScrambles}
                    />
                </td>
            </tr>
            {!!mbld && !!bestMbldAttempt && Number(mbld) < bestMbldAttempt && (
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

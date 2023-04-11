import { useDispatch, useSelector } from "react-redux";
import { MBLD_DEFAULT, MBLD_MIN } from "../constants/wca.constants";
import RootState from "../model/RootState";
import { setWcifEvent } from "../redux/slice/WcifSlice";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import WcifEvent from "../model/WcifEvent";
import { mbldCubesExtensionId } from "../util/wcif.util";
import { useCallback, useEffect, useState } from "react";
import { useWriteEffect } from "../util/extension.util";

interface MbldDetailProps {
    mbldWcifEvent: WcifEvent;
}

const MbldDetail = ({ mbldWcifEvent } : MbldDetailProps) => {
    const bestMbldAttempt = useSelector(
        (state: RootState) => state.eventDataSlice.bestMbldAttempt
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const [mbld, setMbld] = useState<string>(
        mbldWcifEvent.extensions.find(
            (it) => it.id === mbldCubesExtensionId
        )?.data?.requestedScrambles ?? MBLD_DEFAULT
    );

    const dispatch = useDispatch();

    const buildMbldExtension = useCallback(
        () => {
            return {
                id: mbldCubesExtensionId,
                specUrl: '',
                data: { requestedScrambles: mbld }
            };
        }, [mbld]
    )

    useWriteEffect(
        mbldWcifEvent,
        mbldCubesExtensionId,
        dispatch,
        setWcifEvent,
        buildMbldExtension
    );

    useEffect(() => { dispatch(setFileZip()) }, [dispatch, buildMbldExtension]);

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
                        onChange={(e) => setMbld(e.target.value)}
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

import { useDispatch, useSelector } from "react-redux";
import { MBLD_DEFAULT, MBLD_MIN } from "../constants/wca.constants";
import RootState from "../model/RootState";
import { setWcifEvent } from "../redux/slice/WcifSlice";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import WcifEvent from "../model/WcifEvent";
import { mbldCubesExtensionId } from "../util/wcif.util";
import { useCallback, useMemo } from "react";
import {
    findExtension,
    setExtensionLazily,
    upsertExtension,
} from "../util/extension.util";

interface MbldDetailProps {
    mbldWcifEvent: WcifEvent;
}

const MbldDetail = ({ mbldWcifEvent }: MbldDetailProps) => {
    const bestMbldAttempt = useSelector(
        (state: RootState) => state.eventDataSlice.bestMbldAttempt
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const mbld = useMemo(() => {
        return (
            findExtension(mbldWcifEvent, mbldCubesExtensionId)?.data
                ?.requestedScrambles ||
            bestMbldAttempt ||
            MBLD_DEFAULT
        );
    }, [mbldWcifEvent, bestMbldAttempt]);

    const dispatch = useDispatch();

    const buildMbldExtension = (mbld: number) => {
        return {
            id: mbldCubesExtensionId,
            specUrl: "",
            data: { requestedScrambles: mbld },
        };
    };

    const updateEventMbld = useCallback(
        (mbld: number) => {
            setExtensionLazily(
                mbldWcifEvent,
                mbldCubesExtensionId,
                () => buildMbldExtension(mbld),
                (newWcifEvent) => {
                    newWcifEvent.rounds = newWcifEvent.rounds.map(
                        (wcifRound) => {
                            const overrideExtension = buildMbldExtension(mbld);

                            return upsertExtension(
                                wcifRound,
                                overrideExtension
                            );
                        }
                    );

                    dispatch(setWcifEvent(newWcifEvent));
                    dispatch(setFileZip());
                }
            );
        },
        [dispatch, mbldWcifEvent]
    );

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
                        onChange={(e) =>
                            updateEventMbld(Number(e.target.value))
                        }
                        min={MBLD_MIN}
                        required
                        disabled={generatingScrambles}
                    />
                </td>
            </tr>
            {!!mbld && !!bestMbldAttempt && mbld < bestMbldAttempt && (
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

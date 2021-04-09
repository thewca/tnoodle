import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../model/RootState";
import { setFileZip, setPassword } from "../redux/slice/ScramblingSlice";
import { setCompetitionName } from "../redux/slice/WcifSlice";

const EntryInterface = () => {
    const [showPassword, setShowPassword] = useState(false);

    const editingStatus = useSelector(
        (state: RootState) => state.wcifSlice.editingStatus
    );
    const password = useSelector(
        (state: RootState) => state.scramblingSlice.password
    );
    const competitionName = useSelector(
        (state: RootState) => state.wcifSlice.wcif.name
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleCompetitionNameChange = (name: string) => {
        dispatch(setCompetitionName(name));

        // Require another zip with the new name.
        dispatch(setFileZip());
    };

    const handlePasswordChange = (password: string) => {
        dispatch(setPassword(password));

        // Require another zip with the new password, in case there was a zip generated.
        dispatch(setFileZip());
    };

    return (
        <>
            <div className="col-sm-4 text-left form-group">
                <label className="font-weight-bold" htmlFor="competition-name">
                    Competition Name
                </label>
                <input
                    id="competition-name"
                    className="form-control"
                    placeholder="Competition Name"
                    onChange={(e) =>
                        handleCompetitionNameChange(e.target.value)
                    }
                    value={competitionName}
                    disabled={!editingStatus || generatingScrambles}
                    required
                />
            </div>

            <div className="col-sm-4 text-left form-group">
                <label className="font-weight-bold" htmlFor="password">
                    Password
                </label>
                <div className="input-group">
                    <input
                        id="password"
                        className="form-control"
                        placeholder="Password"
                        type={showPassword ? "" : "password"}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        value={password}
                        disabled={generatingScrambles}
                    />
                    <div
                        className="input-group-prepend"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <span className="input-group-text">
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EntryInterface;

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../model/RootState";
import {
    updateCompetitionName,
    updateFileZipBlob,
    updatePassword,
} from "../redux/ActionCreators";

const EntryInterface = () => {
    const [showPassword, setShowPassword] = useState(false);

    const editingDisabled = useSelector(
        (state: RootState) => state.editingDisabled
    );
    const password = useSelector((state: RootState) => state.password);
    const competitionName = useSelector((state: RootState) => state.wcif.name);
    const generatingScrambles = useSelector(
        (state: RootState) => state.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleCompetitionNameChange = (name: string) => {
        dispatch(updateCompetitionName(name));

        // Require another zip with the new name.
        dispatch(updateFileZipBlob());
    };

    const handlePasswordChange = (password: string) => {
        dispatch(updatePassword(password));

        // Require another zip with the new password, in case there was a zip generated.
        dispatch(updateFileZipBlob());
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
                    disabled={editingDisabled || generatingScrambles}
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

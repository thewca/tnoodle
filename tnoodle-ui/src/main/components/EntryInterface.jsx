import React, { useState } from "react";
import {
    updatePassword,
    updateCompetitionName,
    updateFileZipBlob,
} from "../redux/ActionCreators";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";

const EntryInterface = () => {
    const [showPassword, setShowPassword] = useState(false);

    const editingDisabled = useSelector((state) => state.editingDisabled);
    const password = useSelector((state) => state.password);
    const competitionName = useSelector((state) => state.wcif.name);
    const generatingScrambles = useSelector(
        (state) => state.generatingScrambles
    );

    const dispatch = useDispatch();

    const handleCompetitionNameChange = (event) => {
        dispatch(updateCompetitionName(event.target.value));

        // Require another zip with the new name.
        dispatch(updateFileZipBlob(null));
    };

    const handlePasswordChange = (evt) => {
        dispatch(updatePassword(evt.target.value));

        // Require another zip with the new password, in case there was a zip generated.
        dispatch(updateFileZipBlob(null));
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
                    onChange={handleCompetitionNameChange}
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
                        onChange={handlePasswordChange}
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

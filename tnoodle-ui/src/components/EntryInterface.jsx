import React, { Component } from "react";
import {
    updatePassword,
    updateCompetitionName,
    updateFileZipBlob,
} from "../redux/ActionCreators";
import { connect } from "react-redux";
import { getDefaultCompetitionName } from "../util/competition.name.util";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const mapStateToProps = (store) => ({
    editingDisabled: store.editingDisabled,
    competitionName: store.wcif.name,
});

const mapDispatchToProps = {
    updatePassword,
    updateCompetitionName,
    updateFileZipBlob,
};

const EntryInterface = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class EntryInterface extends Component {
        constructor(props) {
            super(props);

            this.state = {
                editingDisabled: props.editingDisabled,
                password: "",
                showPassword: false,
            };
        }

        componentDidMount() {
            this.props.updateCompetitionName(getDefaultCompetitionName());
        }

        handleCompetitionNameChange = (event) => {
            this.props.updateCompetitionName(event.target.value);

            // Require another zip with the new name.
            this.props.updateFileZipBlob(null);
        };

        handlePasswordChange = (event) => {
            let state = this.state;
            state.password = event.target.value;
            this.setState(state);

            this.props.updatePassword(this.state.password);

            // Require another zip with the new password, in case there was a zip generated.
            this.props.updateFileZipBlob(null);
        };

        toogleShowPassword = () => {
            let state = this.state;
            state.showPassword = !state.showPassword;
            this.setState(state);
        };

        render() {
            let competitionName = this.props.competitionName;
            let disabled = this.props.editingDisabled;
            return (
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6 text-left form-group">
                            <label
                                className="font-weight-bold"
                                htmlFor="competition-name"
                            >
                                Competition Name
                            </label>
                            <input
                                id="competition-name"
                                className="form-control"
                                placeholder="Competition Name"
                                onChange={this.handleCompetitionNameChange}
                                value={competitionName}
                                disabled={disabled ? "disabled" : ""}
                                required
                            />
                        </div>

                        <div className="col-sm-6 text-left form-group">
                            <label
                                className="font-weight-bold"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <div className="input-group">
                                <input
                                    id="password"
                                    className="form-control"
                                    placeholder="Password"
                                    type={
                                        this.state.showPassword
                                            ? ""
                                            : "password"
                                    }
                                    onChange={this.handlePasswordChange}
                                    value={this.state.password}
                                />
                                <div
                                    className="input-group-prepend"
                                    onClick={this.toogleShowPassword}
                                >
                                    <span className="input-group-text">
                                        {this.state.showPassword ? (
                                            <FaEye />
                                        ) : (
                                            <FaEyeSlash />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
);

export default EntryInterface;

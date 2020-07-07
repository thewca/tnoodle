import React, { Component } from "react";
import {
    updatePassword,
    updateCompetitionName,
    updateFileZipBlob,
} from "../redux/ActionCreators";
import { connect } from "react-redux";
import { getDefaultCompetitionName } from "../util/competition.name.util";

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
                <div className="row">
                    <div className="container mt-2">
                        <div className="row">
                            <div className="col-md-6 text-left form-group">
                                <label className="font-weight-bold pr-1">
                                    Competition Name
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="Competition Name"
                                    onChange={this.handleCompetitionNameChange}
                                    value={competitionName}
                                    disabled={disabled ? "disabled" : ""}
                                />
                            </div>

                            <div className="col-md-6 text-left form-group">
                                <label className="font-weight-bold pr-1">
                                    Password
                                </label>
                                <input
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
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        checked={this.state.showPassword}
                                        id="showPassword"
                                        readOnly
                                        onClick={this.toogleShowPassword}
                                        class="form-check-input"
                                    />
                                    <label
                                        htmlFor="showPassword"
                                        className="form-check-label"
                                    >
                                        Show password
                                    </label>
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
